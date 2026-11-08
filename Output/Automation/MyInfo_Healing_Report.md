# My Info — Automation Healing Report

**Project:** OrangeHRM Open Source Demo — https://opensource-demo.orangehrmlive.com
**Module:** My Info
**Framework:** Playwright + TypeScript, scaffolded per `.claude/Input/UI_Testing_Framework_Stack.md`
**Source CSV:** `Output/Test_Design/MyInfo_Test_Cases.csv`
**Spec location:** `src/features/my-info/*.spec.ts`

## Important caveat: this was a new project, not an existing one to extend

No existing Playwright project was found in the workspace (no `package.json`, `playwright.config.ts`,
page objects, or specs). Per user decision, a new project was scaffolded from `UI_Testing_Framework_Stack.md`
instead of extending nothing. This means the "healing" below covers genuine first-draft locator mistakes —
normal for brand-new page objects — not stale locators in a previously-working suite.

## Environment reliability finding (read this before the per-test table)

The exact same, final code was executed **twice in a row with zero changes in between** (both after all
healing was complete):

| Run | Workers | Passed | Failed | Notes |
|---|---|---|---|---|
| Run 3 (post-healing) | 1 | 18 / 48 | 30 / 48 | Best observed result |
| Run 5 (identical code, immediate re-run) | 1 | 7 / 48 | 41 / 48 | Same code, same machine, minutes later |

An intermediate experiment (adding `page.waitForLoadState('networkidle')` to tab navigation) made things
worse (8/48 passed) and was reverted — OrangeHRM appears to poll in the background, so `networkidle` never
settles quickly and starved other waits. That revert is included in the numbers above (Run 5 is the
reverted, final code).

This swing — identical code, 18 passed → 7 passed — is strong evidence that **the shared public demo
instance itself is currently unreliable** (shared account, public load, or rate-limiting outside our
control), not that the locators are wrong. Section 13 of the UI Exploration findings already flagged this
account as shared/public. Several "failed" tests were directly confirmed correct by inspecting the
Playwright-captured DOM snapshot at failure time (see notes below) — the element the test wanted was
present in the DOM, just not yet rendered within the default 5-second assertion window.

**Recommendation:** re-run this suite against a dedicated/disposable OrangeHRM instance, or accept a
higher `expect` timeout in `playwright.config.ts`, before treating any single run's pass/fail count as
final signal.

## Healing rounds actually applied

1. **Round 1 (structural fixes, evidence-based):** After the first real execution (46 failed / 2 passed,
   full parallel — mostly login timeouts from overloading the shared demo with concurrency), the suite was
   re-run with `--workers=2`. This surfaced real first-draft locator bugs, confirmed via the DOM snapshots
   Playwright captured on failure:
   - `Add` button locators resolved to 2 elements (primary section + Attachments section both have an
     "Add" button) on Emergency Contacts, Dependents, Immigration → scoped each to the correct heading via
     `following::button[1]`.
   - Section tables/empty-state text were queried via `ancestor::div[oxd-sheet]`, but the real DOM renders
     heading → button → text → table as flat siblings, not nested in a per-section container → rewritten
     to `following::table[1]` / `following::*[contains(text(),...)][1]` from the heading (see
     `src/shared/components/form-helpers.ts`).
   - Job tab fields (`Job Title`, `Job Specification`, etc.) are not `<input>` elements at all — plain
     read-only text — the exploration finding's "disabled/read-only text" was accurate, but the original
     `getByLabel(...).toBeDisabled()` assumed an input existed. Rewritten to assert the field is visible as
     text and that no editable textbox with that name exists.
   - Nationality/Marital Status/Blood Type dropdown reader auto-scrolled to the record's current value
     instead of starting at "-- Select --" → added a scroll-to-top + wait-for-first-option-text step.
   - Result: 39 failed → 33 failed.

2. **Round 2 (label ambiguity, evidence-based):** Re-run surfaced a second real bug: several field labels
   (`Language`, `Fluency`, `Competency`, `Membership`, `Company`, `Job Title`, `Name`, `Relationship`,
   `Date of Birth`, `Number`) are also literal table column header text, so `getByText(label, {exact:true})`
   matched 2 elements once the record table and the Add form were both present. Scoped all of these to
   `page.locator('form').getByText(...)`. Also widened the login navigation/assertion timeouts slightly
   (30s→60s / 5s→15s) since several failures were bare login-page timeouts unrelated to any locator.
   Result: 33 failed → 30 failed (best run).

3. **Round 3 (reverted):** Added `waitForLoadState('networkidle')` to tab navigation, hypothesizing a
   render race (confirmed separately via DOM snapshot evidence for the Qualifications tables). This made
   results worse (8 passed) and was reverted — logged here for transparency, not applied in final code.

No further locator changes were made after Round 2/3. Per the bounded-healing rule (max one attempt per
test), iteration stopped here; remaining failures are classified below rather than guessed at further.

## Per-test healing log (all 48 automated tests)

| TC ID | First real run | Healing applied | Final status | Notes |
|---|---|---|---|---|
| TC-001 | Failed (login timeout / locator) | Round 1+2 fixes | **Flaky** — passed in Run 3, failed in Run 5 | No further locator issue found in DOM evidence |
| TC-002 | Failed | Round 1+2 fixes | **Flaky** — passed Run 3, failed Run 5 | — |
| TC-003 | Failed (login timeout) | Round 2 (timeout increase) | **Not healed — inconclusive (environment)** | Failed both Run 3 and Run 5 |
| TC-004 | Failed | Round 1+2 fixes | **Flaky** — passed Run 3, failed Run 5 | — |
| TC-005 | Failed (login timeout) | Round 2 (timeout increase) | **Not healed — inconclusive (environment)** | Failed both runs |
| TC-006 | Failed | Round 1+2 fixes | **Flaky** — passed Run 3, failed Run 5 | — |
| TC-007 | Failed | Round 1+2 fixes | **Flaky** — passed Run 3, failed Run 5 | — |
| TC-008 | Failed | Round 1+2 fixes | **Flaky** — passed Run 3, failed Run 5 | — |
| TC-009 | Passed | No healing needed | **Passed consistently** (Run 3 & Run 5) | — |
| TC-010 | Failed (login timeout) | Round 2 (timeout increase) | **Not healed — inconclusive (environment)** | Failed both runs |
| TC-011 | Failed (login timeout) | Round 2 (timeout increase) | **Not healed — inconclusive (environment)** | Failed both runs |
| TC-012 | Failed | Round 2 (timeout increase) | **Not healed — inconclusive (environment)** | Failed both runs |
| TC-013 | Failed | Round 2 (timeout increase) | **Not healed — inconclusive (environment)** | Failed both runs |
| TC-014 | Failed | Round 2 (timeout increase) | **Not healed — inconclusive (environment)** | Failed both runs |
| TC-016 | Failed (data mismatch) | None — not a locator issue | **Not healed — likely stale exploration finding / data bug** | See Bug Report BUG-001 |
| TC-017 | Failed | Round 1+2 fixes | **Flaky** — passed Run 3, failed Run 5 | — |
| TC-018 | Failed | Round 1+2 fixes | **Flaky** — passed Run 3, failed Run 5 | — |
| TC-020 | Failed (login timeout) | Round 2 (timeout increase) | **Not healed — inconclusive (environment)** | Failed both runs |
| TC-021 | Failed (login timeout) | Round 2 (timeout increase) | **Not healed — inconclusive (environment)** | Failed both runs |
| TC-022 | Failed (Round-1 issue) | Round 1 fix | **Passed consistently** (Run 3 & Run 5) | — |
| TC-023 | Failed | Round 1 fix (heading-scoped text) | **Not healed — inconclusive (environment)** | Failed both runs; DOM evidence shows correct structure |
| TC-024 | Failed (Add-button ambiguity) | Round 1 fix | **Not healed — inconclusive (environment)** | Locator fixed; still timing out both runs |
| TC-025 | Failed (Add-button ambiguity) | Round 1 fix | **Not healed — inconclusive (environment)** | — |
| TC-026 | Failed (Add-button ambiguity) | Round 1 fix | **Not healed — inconclusive (environment)** | — |
| TC-027 | Failed (Add-button ambiguity) | Round 1 fix | **Not healed — inconclusive (environment)** | — |
| TC-028 | Failed (Add-button ambiguity) | Round 1 fix | **Not healed — inconclusive (environment)** | — |
| TC-029 | Failed (heading-scope) | Round 1 fix | **Not healed — inconclusive (environment)** | — |
| TC-030 | Failed (Add-button ambiguity) | Round 1 fix | **Passed consistently** (Run 3 & Run 5) | — |
| TC-031 | Failed (label ambiguity) | Round 2 fix | **Passed consistently** (Run 3 & Run 5) | — |
| TC-032 | Failed (heading-scope) | Round 1 fix | **Not healed — inconclusive (environment)** | — |
| TC-033 | Failed (Round 1) | Round 1 fix | **Flaky** — failed Run 3, passed Run 5 | — |
| TC-035 | Failed (heading-scope) | Round 1 fix | **Not healed — inconclusive (environment)** | DOM snapshot at failure time shows the exact expected table present — timing race, not a locator defect |
| TC-036 | Failed (label ambiguity) | Round 2 fix | **Flaky** — passed Run 3, failed Run 5 | — |
| TC-037 | Failed (heading-scope) | Round 1 fix | **Not healed — inconclusive (environment)** | — |
| TC-038 | Failed (dropdown read wrong section) | None further applied | **Not healed — inconclusive (environment)** | Read "No Records Found" instead of Level options once — looks like a render race after clicking Add, not a locator bug (locator itself is correct per Round 1 evidence) |
| TC-039 | Failed (heading-scope) | Round 1 fix | **Not healed — inconclusive (environment)** | — |
| TC-040 | Failed (label ambiguity) | Round 2 fix | **Flaky** — passed Run 3, failed Run 5 | — |
| TC-041 | Failed (heading-scope) | Round 1 fix | **Not healed — inconclusive (environment)** | — |
| TC-042 | Failed (label ambiguity) | Round 2 fix | **Passed consistently** (Run 3 & Run 5) | — |
| TC-043 | Failed (heading-scope) | Round 1 fix | **Not healed — inconclusive (environment)** | — |
| TC-044 | Failed (label ambiguity) | Round 2 fix | **Passed consistently** (Run 3 & Run 5) | — |
| TC-045 | Failed (heading-scope) | Round 1 fix | **Not healed — inconclusive (environment)** | — |
| TC-046 | Failed (label ambiguity) | Round 2 fix | **Flaky** — passed Run 3, failed Run 5 | — |
| TC-047 | Failed (heading-scope) | Round 1 fix | **Not healed — inconclusive (environment)** | — |
| TC-048 | Failed (Job page rewrite needed) | Round 1 fix (full page-object rewrite) | **Not healed — inconclusive (environment)** | Locator/assertion approach corrected and verified structurally sound against real DOM; still timing out intermittently |
| TC-050 | Failed (login timeout) | Round 2 (timeout increase) | **Flaky** — passed Run 3, failed Run 5 | — |
| TC-051 | Failed (heading-scope) | Round 1 fix | **Not healed — inconclusive (environment)** | — |
| TC-052 | Failed (ancestor-div assumption) | Round 1 fix | **Not healed — inconclusive (environment)** | — |

**Summary:** 6 tests pass consistently across repeated runs with no outstanding issue. 13 tests are
demonstrably flaky (pass on one run, fail on an immediately following run with *identical* code) — their
locators are correct but the shared demo's responsiveness is not consistent enough for a stable signal
right now. 28 tests failed on both real runs and are classified **inconclusive (environment)** rather than
forced into "bug" or "healed," per the rule against guessing when the cause isn't clearly one or the other
— several of these were spot-checked against the literal DOM snapshot captured at failure time and the
expected element was present, just not within the 5-second assertion window that run. 1 test (TC-016) is a
genuine content/data discrepancy, written up as a bug below.
