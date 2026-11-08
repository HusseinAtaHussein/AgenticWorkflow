# Spec Generation Guide

Detailed guidance for turning one in-scope CSV row into a real spec file inside the target project.
Read this before writing the first spec of a run.

## 1. Learn the project before writing anything

Do this once per run, before generating any spec:

- Read `STACK.md` (or whatever the user pointed you to) in full.
- Open the actual Playwright project: `playwright.config.ts`, `tsconfig.json`, `package.json` scripts,
  and at least 2-3 existing spec files if any exist. STACK.md describes intent; the real files show
  what's actually been built and whether the project has drifted from its own doc. When they disagree,
  the real code wins — but flag the discrepancy to the user rather than silently picking one.
- Find existing page objects / fixtures for the module(s) the CSV rows touch. Search by module name,
  route, and any component names mentioned in the UI exploration findings. If a page object for
  "Qualifications" already exists, extend it (add a missing locator or method) — never create a second,
  parallel `QualificationsPage2` or a one-off inline locator that duplicates what the page object already
  offers.
- Note the project's locator priority. If STACK.md doesn't state one explicitly, use the general
  Playwright best-practice order: `getByRole` (with accessible name) > `getByLabel` > `getByText` >
  `data-testid` > raw CSS/XPath. Raw CSS/XPath selectors are the most likely to go stale — prefer the
  option highest in this list that actually resolves to the intended element.
- Note the tagging convention (e.g. `@automated`, `@smoke`, `@regression`, `test.describe.configure`,
  annotations). Reuse the existing convention; don't invent a new tag scheme.

## 2. One spec (or one test block), one CSV row

Every generated test must carry a visible link back to its source row — a comment or a Playwright
`test.info().annotations` entry naming the exact `TC ID`, right at the top of the test block, e.g.:

```ts
// Source: Test Design CSV — TC-014 — "Employment tab shows validation error on empty Join Date"
test('shows validation error when Join Date is left empty', { tag: '@automated' }, async ({ page }) => {
  ...
});
```

Group related TC IDs from the same feature into one spec file if that matches how the project already
organizes specs (e.g. one file per page/feature, not one file per test case) — follow the existing
pattern rather than defaulting to one-file-per-case.

## 3. Only automate what the exploration findings actually documented

The CSV row's `Steps` and `Expected Result` describe intent; the UI exploration findings file is the
record of what was actually observed live. Before writing a locator or assertion:

- Confirm the field/button/message/state the row references appears in the exploration findings as
  `Observed` (or at minimum `Documented`, with the row's own evidence_type already reflecting that).
- If the exploration findings don't mention it at all, or only mark it `Not Verified` / `Unknown` /
  `Blocked`, do not invent a selector or guess at the expected text. Add the row to the blocker list
  instead (see main SKILL.md Step 2) and move on.
- Use exact text the exploration findings recorded (e.g. an exact validation message) rather than a
  paraphrase — a paraphrased assertion will fail against the real app even when the app is correct.

## 4. Destructive actions require explicit sign-off

Mirror `ui-explorer`'s rule: don't write a spec that performs permanent/bulk deletion, production data
mutation, a financial transaction, a real booking, sending a real message, or changing a critical account
setting, unless the CSV row or the user explicitly says this is safe for the target environment. If a row
implies this kind of action without that sign-off, add it to the blocker list with the reason
"destructive action — not authorized for this environment," rather than writing (and definitely rather
than running) a spec for it.

## 5. Wait for real state, not fixed timeouts

Use Playwright's own auto-waiting and web-first assertions (`expect(locator).toBeVisible()`,
`toHaveText()`, etc.) rather than `page.waitForTimeout()`. A fixed sleep is exactly the kind of thing
that produces flaky "failures" that look like they need healing but are really just a race condition in
the spec itself — get this right up front and there will be less to heal later.
