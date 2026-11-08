# My Info — Automation Summary

**Project:** OrangeHRM Open Source Demo — https://opensource-demo.orangehrmlive.com
**Module:** My Info
**Source CSV:** `Output/Test_Design/MyInfo_Test_Cases.csv` (53 rows)

## Was there an existing Playwright project to extend?

No. No `package.json`, `playwright.config.ts`, page objects, fixtures, or specs existed anywhere in the
workspace prior to this run. Per explicit user decision, a **new** project was scaffolded following
`.claude/Input/UI_Testing_Framework_Stack.md` (Page Object Model, `src/features/<module>/`, `test.extend()`
auth fixture, Playwright's built-in HTML reporter, `@automated` tag convention) rather than extending
nothing. This is a deviation from the skill's default ("extend an existing project") made necessary because
no existing project was present.

## Scope decisions

CSV rows were filtered with `scripts/automation_tools.py scope`: `Valid in Scope = 1 AND Needs automation = 1`.

| Bucket | Count | TC IDs |
|---|---|---|
| Automate (initial filter) | 49 | TC-001–018, 020–033, 035–048, 050–052 |
| Blocked — data mutation, not authorized | 1 | **TC-015** (see below) |
| **Generated & executed** | **48** | listed in full in the Healing Report |
| Valid in scope but flagged "Needs automation = No" (manual only) | 3 | TC-019, TC-034, TC-049 |
| Out of scope (`Valid in Scope = 0`) | 1 | TC-053 |

### TC-015 — additionally blocked beyond the CSV filter

TC-015 ("Enter an Employee Id value at exactly the 10-character boundary") is marked
`Needs automation = 1` in the CSV, but its expected result is "the form **proceeds to save**" — i.e. it
persists a valid 10-character Employee ID to the live shared-demo record. The user did not authorize any
data-mutating automation against the shared demo instance, so this row was **not** generated, despite
passing the CSV filter. It is blocked pending a disposable/sandbox environment, consistent with how the
UI Exploration findings (Section 13) already flagged the Date-of-Birth persistence incident on this same
account.

### Manual-only rows (not generated, per CSV review)

- **TC-019** — future Date of Birth persistence defect. Explicitly marked `Needs automation = No` because
  confirming it requires saving to the live record (same persistence risk as TC-015).
- **TC-034** — Immigration "Visa" radio button. Marked `Needs automation = No`; the UI Exploration findings
  record this as blocked by a click-interception issue during manual exploration, with behavior not
  verified — nothing to safely automate against undocumented behavior.
- **TC-049** — Job tab "Include Employment Contract Details" toggle. Marked `Needs automation = No`;
  exploration only established the toggle didn't respond to a click, with no verified enabled-state
  behavior to assert against.

### Out-of-scope row

- **TC-053** — `Valid in Scope = 0`, `Needs automation = 0`. Row content is a duplicate of TC-051 with
  scenario/module fields literally set to "Not Valid" — correctly excluded by the reviewer.

## What was generated

48 Playwright tests across 12 spec files, all tagged `@automated` and annotated with their source `TC ID`
in a leading comment, under `src/features/my-info/`:

- `navigation.spec.ts` (TC-001–010)
- `personal-details.spec.ts` (TC-011–014, 016–018)
- `contact-details.spec.ts` (TC-020–023)
- `emergency-contacts.spec.ts` (TC-024–028)
- `dependents.spec.ts` (TC-029–031)
- `immigration.spec.ts` (TC-032–033)
- `qualifications.spec.ts` (TC-035–044)
- `memberships.spec.ts` (TC-045–047)
- `job.spec.ts` (TC-048)
- `salary.spec.ts` (TC-050)
- `report-to.spec.ts` (TC-051)
- `attachments-common.spec.ts` (TC-052)

Supporting page objects/fixtures added under `src/features/*/`, `src/shared/`, `src/fixtures/` — see
`src/shared/components/form-helpers.ts` for the shared heading-scoped locator helpers used across pages,
matching the real (flat-sibling) DOM structure discovered during execution.

## Execution — real, not simulated

The suite was executed for real with `npx playwright test` five times total during this session (two
exploratory diagnostic runs, two healing-fix verification runs, one final confirmation run — see
`MyInfo_Healing_Report.md` for the full history). The final code was run twice back-to-back with **zero
changes** between runs and produced 18/48 and then 7/48 passes — clear evidence that the shared public
demo's reliability, not the test code, is the dominant variable right now. Full detail, per-test
classification, and the recommendation to re-run against a dedicated instance are in the Healing Report.

- **HTML execution report (most recent real run):** `playwright-report/index.html` — run
  `npx playwright show-report` from the project root, or open the file directly. Includes pass/fail status
  and, per failed test, links to its trace, screenshot, and video (also present under `test-results/`).
- **Healing log:** `Output/Automation/MyInfo_Healing_Report.md`
- **Bug report:** `Output/Automation/MyInfo_Bug_Report.md` (one genuine finding: BUG-001 / TC-016)

## Honesty checks performed

- No credentials appear in any spec, fixture, config, report, or log — `ORANGEHRM_USERNAME` /
  `ORANGEHRM_PASSWORD` are read from environment variables only (`src/fixtures/auth.fixture.ts`).
- The source CSV, PRD, UI Exploration findings, and STACK.md were not modified.
- Every generated spec file carries a `// Source: Test Design CSV — TC-XXX — "..."` comment immediately
  above its test.
- No assertion was loosened, removed, or wrapped in try/catch to force a pass; the one content mismatch
  found (TC-016) is reported as a bug, not patched over.
- Every skipped/blocked/manual-only CSV row is listed above with its reason — none were silently dropped.
