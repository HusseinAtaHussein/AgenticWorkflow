# Healing and Bug Reporting — Detailed Rules

Read this before the first execution pass of a run, and keep it open while classifying failures.

## Why bounded healing exists

A locator can go stale for a reason that has nothing to do with a real defect — the team renamed a
`data-testid`, wrapped a button in a new container, or changed label text slightly. Re-running that test
forever with the same broken locator wastes the run; but "fixing" it by loosening the assertion instead
of the locator hides a real regression behind a test that no longer tests anything. Bounded healing tries
to recover the first kind of failure once, cheaply, while refusing to touch the second kind at all.

## Step-by-step healing procedure (per failing test)

1. **Read the actual failure first.** Playwright's error output (timeout waiting for locator, strict
   mode violation, element not visible, etc.) tells you which category you're in. A locator/timeout
   failure is a healing candidate. An assertion mismatch (`expect(received).toBe(expected)` where both
   sides resolved fine but disagree) is not — that's a behavior difference, not a stale selector, and
   goes straight to bug classification.
2. **Re-inspect the live page once.** Navigate to the same state the test was in when it failed (reuse
   the trace/DOM snapshot Playwright captured, or take a fresh look via the same live app) and look for
   the element the test intended to interact with. Apply the same locator priority as spec generation:
   look for it by role/accessible name first, then label/text, then `data-testid`, only falling back to
   CSS as a last resort.
3. **Judge plausibility before applying anything.** A found element only counts as the fix if it's
   clearly the same UI element the test meant to target (same visual position/purpose, not just "an
   element that happens to match some selector"). If nothing plausible turns up, stop — this is not
   healed, it's either a genuine app bug or inconclusive, and the boundary between those is not yours to
   force a decision on if the evidence doesn't clearly support one.
4. **Apply the fix and re-run only that one test.** Don't rerun the whole suite to confirm — that burns
   time and can mask which specific change fixed which specific test. Record the before/after diff either
   way, even if the re-run still fails.
5. **Stop at one attempt.** If the healed locator still doesn't work, do not try a second guess. Leave it
   failing and move to bug classification. Looping through candidate locators until something sticks
   produces a spec nobody can trust, because the "working" locator was never validated against actual
   understanding of the page — it was found by trial and error.

## What counts as healing vs. what never does

**Allowed (locator/timing only):**
- Swapping a stale CSS selector for a role/label/text locator that resolves to the same element.
- Fixing a `data-testid` that was renamed.
- Replacing a fixed `waitForTimeout` with a proper web-first wait/assertion when timing was the actual
  cause of flakiness (confirm this from the trace, not a guess).
- Narrowing an overly broad locator that was matching multiple elements (strict-mode violation) down to
  the one the test actually meant.

**Never allowed as "healing" (always flag for human review instead):**
- Changing an expected value, expected text, or assertion condition to match whatever the app currently
  returns.
- Removing or weakening an assertion so the test passes regardless of the actual result.
- Changing which UI state/page the test expects to land on.
- Adding a `try/catch` around an assertion to swallow the failure.

If the only way to make a test pass is one of the never-allowed changes, the test stays failing and gets
reported as a genuine failure — do not touch the assertion under any framing ("just aligning expectations"
included).

## Classifying every failure into exactly one bucket

- **Healed — selector fix applied, now passing.** A locator/timing fix was applied per the rules above,
  and the re-run of that specific test passed.
- **Not healed — likely app bug, needs human review.** The element genuinely isn't there / doesn't behave
  as the exploration findings and CSV describe, and no plausible locator fix exists. This is bug-entry
  material.
- **Not healed — inconclusive, needs human review.** Something failed but the cause isn't clearly a stale
  locator or clearly an app defect (e.g. intermittent timing issue that didn't reproduce cleanly, an
  environment error, a Playwright infrastructure error unrelated to the app). Don't force this into one of
  the other two buckets just to make the report look cleaner.

Never present a healed test as if it passed on the first attempt — the report must show the failure, the
diagnosis, the fix, and the passing re-run as separate facts, in that order.

## The "shouldn't have needed healing" signal

If a healing fix looks bigger than a rename or minor restructure — e.g. an entire flow moved to a
different page, a field that the exploration findings describe as required now appears optional, a
button that used to submit a form now opens a confirmation modal first — that's not a stale-selector
problem, it's the UI itself having changed since the exploration report was written. Flag this explicitly
in the healing report: the exploration findings document may now be stale, not just the script. Don't
quietly absorb this into a routine "Healed" entry; call out that the exploration doc itself may need
re-running through `ui-explorer`.

## Writing a bug entry a human can actually file

For every "Not healed — likely app bug" (and, when there's enough evidence, "inconclusive") failure,
write an entry with:

- **Test case ID and title** (from the CSV).
- **Steps to reproduce** — copy the CSV's `Steps`, adjusted only for concrete values actually used during
  this run (never invent steps not in the CSV).
- **Expected result** — the CSV's `Expected Result` (and/or the exploration findings' observed behavior).
- **Actual result** — literally what was observed: the real error message, the real UI state, described
  from the trace/screenshot, never paraphrased into an assumption about the root cause ("the API call
  failed" is not something you saw — "the page stayed on the loading spinner and no table appeared" is).
- **Environment** — browser/project config used (from `playwright.config.ts`), app URL, module.
- **Evidence links** — paths to the trace file, screenshot(s), and video (if captured) from this actual
  run. Never link to evidence that wasn't produced by a real execution.
- **Source test case ID** — the CSV `TC ID`, so the bug traces back cleanly.

If no bugs were found this run, say so explicitly in the report rather than omitting the section.
