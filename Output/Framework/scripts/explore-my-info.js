/**
 * UI Exploration automation for the My Info module (OrangeHRM demo).
 *
 * Purpose: drive a REAL browser (Playwright, no MCP available in this environment)
 * to observe the My Info module's actual UI behavior — forms, dropdowns, validation,
 * tables — and dump that evidence to JSON/screenshots for a human/agent to turn into
 * the UI Exploration Markdown report. This script performs NO destructive actions:
 * it never clicks a final Save/Submit that would persist a new or cleared record. It
 * only reads state and, where a Save button is clicked, it is to trigger and capture
 * client-side validation errors on a form that is then cancelled, never carried through.
 *
 * Credentials are read from environment variables only (LOGIN_USERNAME / LOGIN_PASSWORD)
 * and are never written to any log, JSON file, or screenshot produced by this script.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';
const USERNAME = process.env.LOGIN_USERNAME;
const PASSWORD = process.env.LOGIN_PASSWORD;

// This is a shared public demo instance — observed directly during this run,
// its UI language can be German instead of English depending on what other
// concurrent users last set (see run-log / blockers). Route paths (hrefs)
// stay stable across locales, so navigation below matches on href fragments,
// not on visible link text, and only uses this map to attach a stable,
// human-readable label to whatever tab actually renders.
const TAB_ROUTE_MAP = [
  { frag: 'viewPersonalDetails', label: 'Personal Details' },
  { frag: 'contactDetails', label: 'Contact Details' },
  { frag: 'viewEmergencyContacts', label: 'Emergency Contacts' },
  { frag: 'viewDependents', label: 'Dependents' },
  { frag: 'viewImmigration', label: 'Immigration' },
  { frag: 'viewJobDetails', label: 'Job' },
  { frag: 'viewSalaryList', label: 'Salary' },
  { frag: 'viewReportToDetails', label: 'Report-to' },
  { frag: 'viewQualifications', label: 'Qualifications' },
  { frag: 'viewMemberships', label: 'Memberships' },
];

const ARTIFACT_DIR = path.join(__dirname, '..', 'artifacts');
const SCREENSHOT_DIR = path.join(ARTIFACT_DIR, 'screenshots');
const DATA_DIR = path.join(ARTIFACT_DIR, 'data');

for (const dir of [ARTIFACT_DIR, SCREENSHOT_DIR, DATA_DIR]) {
  fs.mkdirSync(dir, { recursive: true });
}

const findings = {
  meta: {
    url: BASE_URL,
    startedAt: new Date().toISOString(),
  },
  authentication: { status: 'Unknown' },
  navigation: {},
  tabs: [],
  blockers: [],
};

const log = [];
function note(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  log.push(line);
  console.log(line);
}

function addBlocker(area, description, impact) {
  findings.blockers.push({ area, description, impact });
  note(`BLOCKER (${area}): ${description}`);
}

async function shot(page, name) {
  const file = path.join(SCREENSHOT_DIR, `${name}.png`);
  try {
    await page.screenshot({ path: file, fullPage: true });
    return path.relative(ARTIFACT_DIR, file);
  } catch (e) {
    note(`Screenshot failed for ${name}: ${e.message}`);
    return null;
  }
}

// Discover the module's real tabs by their href route fragments (language
// independent), using TAB_ROUTE_MAP purely to attach a readable label to
// whatever is actually found in the live DOM. Any tab link whose href
// doesn't match a known fragment is still recorded (labelled "Unmapped tab
// (href: ...)") rather than silently dropped — full coverage means we don't
// get to skip something just because we didn't anticipate it.
async function discoverTabs(page) {
  const seed = page.locator('a[href*="viewPersonalDetails"]').first();
  if (await seed.count() === 0) return [];
  const handle = await seed.elementHandle();
  if (!handle) return [];
  const hrefs = await page.evaluate((el) => {
    let node = el;
    while (node && node.parentElement) {
      node = node.parentElement;
      const links = Array.from(node.querySelectorAll('a[href]'));
      if (links.length >= 3) {
        const seen = new Set();
        const out = [];
        for (const a of links) {
          const href = a.getAttribute('href');
          if (href && !seen.has(href)) { seen.add(href); out.push(href); }
        }
        return out;
      }
    }
    return [];
  }, handle);
  return hrefs.map((href) => {
    const match = TAB_ROUTE_MAP.find((t) => href.includes(t.frag));
    return { href, label: match ? match.label : `Unmapped tab (href: ${href})`, frag: match ? match.frag : href };
  });
}

// Tag every currently-existing "Save"-labelled button so that after opening
// a new Add form, we can identify which Save button is NEW rather than
// guessing with .first()/.last() — this is what prevents accidentally
// clicking Save on an unrelated, already-populated form (e.g. Personal
// Details) when isolating a freshly-opened Add sub-form.
async function tagExistingSaveButtons(page) {
  await page.evaluate(() => {
    document.querySelectorAll('button').forEach((b) => {
      if (/save|speichern/i.test(b.textContent || '')) b.setAttribute('data-explore-existing', '1');
    });
  });
}

// After clicking "Add", find the Save button that did NOT exist before
// (see tagExistingSaveButtons), then walk up its ancestors until we find a
// container that also has a Cancel button — that container is the isolated
// scope for the newly-opened form. Tags it with a unique marker attribute.
// Returns false (and tags nothing) if no such new+isolated scope is found —
// callers must treat that as "cannot safely isolate" and skip any Save click.
async function findNewFormScope(page, marker) {
  return page.evaluate((marker) => {
    const newSaveButtons = Array.from(document.querySelectorAll('button'))
      .filter((b) => /save|speichern/i.test(b.textContent || '') && !b.hasAttribute('data-explore-existing'));
    if (newSaveButtons.length === 0) return false;
    const btn = newSaveButtons[newSaveButtons.length - 1];
    let node = btn;
    for (let i = 0; i < 8 && node; i++) {
      node = node.parentElement;
      if (!node) break;
      const buttons = Array.from(node.querySelectorAll('button')).map((b) => (b.textContent || '').trim());
      if (buttons.some((t) => /cancel|abbrechen/i.test(t))) {
        node.setAttribute('data-explore-marker', marker);
        return true;
      }
    }
    return false;
  }, marker);
}

// Capture metadata for every native/oxd input-like field inside a container.
async function captureFields(container) {
  return container.evaluate((root) => {
    function labelFor(el) {
      const group = el.closest('.oxd-input-group, .oxd-input-field-error-message, div');
      if (group) {
        const lbl = group.querySelector('label');
        if (lbl) return lbl.textContent.trim();
      }
      return null;
    }
    function isRequired(el) {
      const group = el.closest('.oxd-input-group') || el.parentElement;
      if (!group) return false;
      return /\*/.test(group.textContent || '');
    }
    const results = [];
    root.querySelectorAll('input, textarea').forEach((el) => {
      if (el.type === 'hidden') return;
      results.push({
        kind: 'input',
        tag: el.tagName.toLowerCase(),
        type: el.type || null,
        name: el.name || null,
        placeholder: el.placeholder || null,
        label: labelFor(el),
        required: isRequired(el),
        disabled: !!el.disabled,
        readonly: !!el.readOnly,
        value: el.type === 'password' ? null : el.value || null,
      });
    });
    // OrangeHRM custom "select" widgets
    root.querySelectorAll('.oxd-select-text').forEach((el) => {
      results.push({
        kind: 'custom-dropdown',
        label: labelFor(el),
        currentText: el.textContent.trim(),
        required: isRequired(el),
        disabled: el.className.includes('disabled'),
      });
    });
    root.querySelectorAll('input[type="radio"]').forEach(() => {});
    root.querySelectorAll('input[type="checkbox"]').forEach(() => {});
    return results;
  });
}

async function enumerateDropdownOptions(page, dropdownLocator) {
  try {
    await dropdownLocator.click({ timeout: 5000 });
    const menu = page.locator('.oxd-select-dropdown').first();
    await menu.waitFor({ state: 'visible', timeout: 5000 });
    const options = await menu.locator('.oxd-select-option').allTextContents();
    await page.keyboard.press('Escape');
    return options.map((o) => o.trim()).filter(Boolean);
  } catch (e) {
    try { await page.keyboard.press('Escape'); } catch (_) {}
    return { error: e.message };
  }
}

async function run() {
  if (!USERNAME || !PASSWORD) {
    addBlocker('Authentication', 'LOGIN_USERNAME / LOGIN_PASSWORD env vars not provided', 'Cannot log in; exploration aborted');
    fs.writeFileSync(path.join(DATA_DIR, 'my-info-findings.json'), JSON.stringify(findings, null, 2));
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('pageerror', (err) => note(`  [page error] ${err.message}`));
  page.on('console', (msg) => { if (msg.type() === 'error') note(`  [console error] ${msg.text()}`); });

  try {
    note('Navigating to login page');
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.locator('input[name="username"]').fill(USERNAME);
    await page.locator('input[name="password"]').fill(PASSWORD);
    await shot(page, '01-login-page');
    await page.locator('button[type="submit"]').click();

    // Verify login success from observable UI evidence. This is a shared public
    // demo instance whose UI language can vary between sessions depending on what
    // other concurrent users last set (observed directly during this work — one
    // run rendered the whole app in German), so success is checked via the route
    // (stable across locales) plus a structural element (user avatar dropdown),
    // never via English link/heading text.
    try {
      await page.waitForURL('**/dashboard/**', { timeout: 20000 });
      const userArea = page.locator('.oxd-userdropdown-tab, .oxd-topbar-header-userarea').first();
      await userArea.waitFor({ state: 'visible', timeout: 10000 });
      findings.authentication.status = 'Successful';
      note('Login successful — post-login route reached and user menu visible');
      await shot(page, '02-dashboard-after-login');
    } catch (e) {
      findings.authentication.status = 'Failed';
      addBlocker('Authentication', `Post-login landing page not detected: ${e.message}`, 'Cannot proceed into My Info');
      await shot(page, '02-login-failed-state');
      throw new Error('LOGIN_FAILED');
    }

    // Navigate to My Info via sidebar (real UI navigation, not direct URL typing).
    // Matched by href fragment, not link text, for the same locale reason above.
    note('Clicking My Info in sidebar');
    let myInfoLink = page.locator('a[href*="viewMyDetails"], a[href*="viewPersonalDetails"]').first();
    if (await myInfoLink.count() === 0) {
      // Fall back to text match in case the route differs from what was observed
      // in the earlier English-rendered session.
      myInfoLink = page.getByRole('link', { name: /My Info|Persönliche Informationen/i });
    }
    await myInfoLink.waitFor({ state: 'visible', timeout: 10000 });
    await myInfoLink.click();
    await page.waitForURL('**/viewMyDetails**', { timeout: 15000 }).catch(() => {});
    await page.waitForLoadState('domcontentloaded').catch(() => {});
    await page.waitForTimeout(1500);
    findings.navigation.myInfoUrl = page.url();
    await shot(page, '03-my-info-landing');
    note(`My Info landed at ${page.url()}`);

    // Discover module title / employee card
    const heading = await page.locator('h6').first().textContent().catch(() => null);
    findings.navigation.headingSample = heading ? heading.trim() : null;

    // Discover the real tab list (by href fragment — see discoverTabs comment)
    const tabs = await discoverTabs(page);
    findings.navigation.discoveredTabs = tabs.map((t) => t.label);
    note(`Discovered tabs: ${JSON.stringify(tabs.map((t) => t.label))}`);

    if (tabs.length === 0) {
      addBlocker('Navigation', 'Could not generically discover My Info tab strip', 'Falling back to Personal Details only');
      tabs.push({ href: null, label: 'Personal Details', frag: 'viewPersonalDetails' });
    }

    for (const tab of tabs) {
      const tabName = tab.label;
      const tabResult = { name: tabName, screenshots: [], fields: [], dropdowns: [], addForms: [], table: null, notes: [] };
      try {
        note(`--- Exploring tab: ${tabName} ---`);
        let tabLink = page.locator(`a[href*="${tab.frag}"]`).first();
        if (await tabLink.count() === 0) {
          // The tablist can take a moment to remount after a Cancel/navigation —
          // give it one real chance to reappear before giving up on this tab.
          await page.waitForTimeout(1500);
          tabLink = page.locator(`a[href*="${tab.frag}"]`).first();
        }
        if (await tabLink.count() === 0) {
          tabResult.notes.push('Tab link not found at click time — skipped');
          addBlocker(tabName, 'Tab link disappeared/not found', 'Skipped this tab');
          await shot(page, `tab-${slug(tabName)}-00-missing-link`);
          findings.tabs.push(tabResult);
          continue;
        }
        await tabLink.scrollIntoViewIfNeeded().catch(() => {});
        await tabLink.click();
        await page.waitForLoadState('domcontentloaded').catch(() => {});
        await page.waitForTimeout(2000);
        tabResult.url = page.url();
        const shotPath = await shot(page, `tab-${slug(tabName)}-01-landing`);
        if (shotPath) tabResult.screenshots.push(shotPath);

        const content = page.locator('.orangehrm-background-container, .oxd-layout-context, main').first();
        const scope = (await content.count()) > 0 ? content : page.locator('body');

        // Fields directly on the tab (e.g. Personal Details form)
        tabResult.fields = await captureFields(scope).catch((e) => ({ error: e.message }));

        // Dropdowns directly on the tab
        const directDropdowns = scope.locator('.oxd-select-text');
        const ddCount = await directDropdowns.count().catch(() => 0);
        for (let i = 0; i < ddCount; i++) {
          const dd = directDropdowns.nth(i);
          const labelText = await dd.evaluate((el) => {
            const group = el.closest('.oxd-input-group');
            const lbl = group ? group.querySelector('label') : null;
            return lbl ? lbl.textContent.trim() : null;
          }).catch(() => null);
          const options = await enumerateDropdownOptions(page, dd);
          tabResult.dropdowns.push({ label: labelText, options: summarizeOptions(options) });
        }

        // Tables
        const table = scope.locator('.oxd-table, table').first();
        if (await table.count() > 0) {
          const rows = await table.locator('.oxd-table-row, tr').count().catch(() => 0);
          const searchPresent = await page.locator('input[placeholder]').filter({ hasText: '' }).count().catch(() => 0);
          tabResult.table = { present: true, approxRowCount: rows };
        } else {
          tabResult.table = { present: false };
        }

        // "No Records Found" empty state
        const emptyState = page.getByText('No Records Found');
        tabResult.emptyStateObserved = (await emptyState.count().catch(() => 0)) > 0;

        // Add buttons -> open each, capture form + dropdowns, then (only if the
        // new form's scope can be safely isolated) test empty-submit and one
        // invalid-input round, then Cancel. Never fall back to page-wide scope
        // for clicking Save — that risk (accidentally resubmitting an existing
        // top-level record like Personal Details) is exactly what happened in
        // an earlier run of this script and is now guarded against explicitly.
        const ADD_NAME_RE = /^(Add|Hinzufügen)$/i;
        const addButtonCount = await scope.getByRole('button', { name: ADD_NAME_RE }).count().catch(() => 0);
        note(`  Found ${addButtonCount} Add button(s) on ${tabName}`);
        for (let i = 0; i < addButtonCount; i++) {
          const addResult = { index: i, fields: [], dropdowns: [], emptySubmitErrors: [], invalidInputErrors: [], notes: [] };
          const marker = `add-${slug(tabName)}-${i}`;
          try {
            await tagExistingSaveButtons(page);
            // Re-query fresh each iteration since prior Cancels can shift indices
            const btn = scope.getByRole('button', { name: ADD_NAME_RE }).nth(i);
            await btn.click();
            await page.waitForTimeout(900);

            const isolated = await findNewFormScope(page, marker);
            let formScope = isolated ? page.locator(`[data-explore-marker="${marker}"]`) : null;

            if (!formScope) {
              addResult.notes.push('Could not safely isolate this Add form\'s scope from the rest of the page — skipped Save/Cancel interaction entirely to avoid touching unrelated forms; only a screenshot was captured.');
              addBlocker(`${tabName} — Add form ${i}`, 'Form scope could not be isolated (no distinguishable new Save+Cancel container found)', 'Skipped field capture and validation testing for this form');
              await shot(page, `tab-${slug(tabName)}-add${i}-unisolated`);
              // Best-effort: try to close via Escape without touching any Save button
              await page.keyboard.press('Escape').catch(() => {});
              tabResult.addForms.push(addResult);
              continue;
            }

            addResult.fields = await captureFields(formScope).catch((e) => ({ error: e.message }));

            const formDropdowns = formScope.locator('.oxd-select-text');
            const fddCount = await formDropdowns.count().catch(() => 0);
            for (let j = 0; j < fddCount; j++) {
              const dd = formDropdowns.nth(j);
              const labelText = await dd.evaluate((el) => {
                const group = el.closest('.oxd-input-group');
                const lbl = group ? group.querySelector('label') : null;
                return lbl ? lbl.textContent.trim() : null;
              }).catch(() => null);
              const options = await enumerateDropdownOptions(page, dd);
              addResult.dropdowns.push({ label: labelText, options: summarizeOptions(options) });
            }

            await shot(page, `tab-${slug(tabName)}-add${i}-form`);

            const saveBtn = formScope.getByRole('button', { name: /^(Save|Speichern)$/i }).first();
            const hasSave = await saveBtn.count().catch(() => 0);

            if (hasSave > 0) {
              // Round 1: empty submit
              await saveBtn.click().catch(() => {});
              await page.waitForTimeout(700);
              addResult.emptySubmitErrors = await formScope.locator('.oxd-input-field-error-message')
                .allTextContents().then((arr) => arr.map((e) => e.trim()).filter(Boolean)).catch(() => []);
              await shot(page, `tab-${slug(tabName)}-add${i}-empty-submit`);

              // Round 2: one invalid value per obvious field type, then submit again
              const textInputs = formScope.locator('input[type="text"]:not([readonly]):not([disabled])');
              const tCount = await textInputs.count().catch(() => 0);
              if (tCount > 0) {
                await textInputs.first().fill('X'.repeat(256)).catch(() => {});
              }
              const dateInputs = formScope.locator('input[placeholder*="yyyy" i], input[placeholder*="dd" i]');
              const dCount = await dateInputs.count().catch(() => 0);
              if (dCount > 0) {
                await dateInputs.first().fill('31/13/9999').catch(() => {});
              }
              if (tCount > 0 || dCount > 0) {
                await saveBtn.click().catch(() => {});
                await page.waitForTimeout(700);
                addResult.invalidInputErrors = await formScope.locator('.oxd-input-field-error-message')
                  .allTextContents().then((arr) => arr.map((e) => e.trim()).filter(Boolean)).catch(() => []);
                await shot(page, `tab-${slug(tabName)}-add${i}-invalid-input`);
              } else {
                addResult.notes.push('No plain text/date inputs found to attempt an invalid-value round on');
              }
            } else {
              addResult.notes.push('No Save button found within the isolated form scope');
            }

            // Cancel out — never persist anything this script opened
            const cancelBtn = formScope.getByRole('button', { name: /Cancel|Abbrechen/i }).first();
            if (await cancelBtn.count().catch(() => 0) > 0) {
              await cancelBtn.click().catch(() => {});
            } else {
              await page.keyboard.press('Escape').catch(() => {});
            }
            await formScope.waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
            await page.waitForTimeout(800);
          } catch (e) {
            addResult.error = e.message;
            note(`  Add form ${i} on ${tabName} errored: ${e.message}`);
          }
          tabResult.addForms.push(addResult);
        }

        findings.tabs.push(tabResult);
      } catch (e) {
        addBlocker(tabName, `Unhandled error exploring tab: ${e.message}`, 'Tab exploration incomplete');
        findings.tabs.push(tabResult);
      }
    }
  } catch (e) {
    note(`Fatal run error: ${e.message}`);
  } finally {
    findings.meta.finishedAt = new Date().toISOString();
    fs.writeFileSync(path.join(DATA_DIR, 'my-info-findings.json'), JSON.stringify(findings, null, 2));
    fs.writeFileSync(path.join(DATA_DIR, 'run-log.txt'), log.join('\n'));
    await browser.close();
  }
}

function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function summarizeOptions(options) {
  if (options && options.error) return options;
  if (!Array.isArray(options)) return options;
  if (options.length > 20) {
    return {
      total: options.length,
      first5: options.slice(0, 5),
      last5: options.slice(-5),
    };
  }
  return { total: options.length, all: options };
}

run();
