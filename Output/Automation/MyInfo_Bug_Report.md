# My Info — Automation Bug Report

Only one failure across all runs was a genuine, reproducible content/data mismatch rather than an
environment-timing artifact. All other unresolved failures are documented as environment-instability
findings in `MyInfo_Healing_Report.md`, not as bugs, because the same code passed and failed on identical
re-runs — that pattern does not meet the bar for "likely app bug."

---

## BUG-001 — Nationality dropdown does not contain "Afghan" as the UI Exploration findings document

- **Source Test Case ID:** TC-016 — "Verify Nationality dropdown default value and full option list"
- **Steps to reproduce** (from the CSV, as executed):
  1. Navigate to My Info > Personal Details.
  2. Open the Nationality dropdown.
  3. Scroll through its option list.
- **Expected result** (per CSV / UI Exploration findings, Section 6): dropdown displays an alphabetical
  list of ~195 nationality options starting with "Afghan" and ending with "Zimbabwean".
- **Actual result:** After resetting the dropdown's scroll position to the top (its own auto-scroll
  otherwise jumps to the record's current value), the first entries read `["-- Select --", "Albanian",
  "Algerian", "American", "Andorran", ...]` — **no "Afghan" option is present in the rendered list.**
  Captured via `options.allTextContents()` against the live `.oxd-select-dropdown .oxd-select-option`
  elements.
- **Environment:** Chromium (Desktop Chrome profile), `https://opensource-demo.orangehrmlive.com`, OrangeHRM
  OS 5.9, per `playwright.config.ts`.
- **Evidence:** `test-results/features-my-info-personal--3cf8e-ll-alphabetical-option-list-chromium/`
  (screenshot, video, `error-context.md` with the full received option array).
- **Assessment:** This is an assertion mismatch, not a stale locator — the dropdown opened correctly and
  the option list itself was read successfully; the values simply don't match what was recorded. Two
  explanations are possible and neither can be confirmed from this session alone: (a) the UI Exploration
  finding was recorded incorrectly (assumed "Afghan" as the typical first nationality without confirming
  against this specific deployment's data), or (b) the demo's underlying nationality reference data has
  changed since the exploration was run. Recommend re-verifying this specific dropdown's option list
  manually and correcting either the exploration finding or the underlying data, whichever is wrong.
- **Not a candidate for healing:** per the bounded-healing rules, an assertion mismatch where both sides
  resolved correctly is a behavior/content difference, not a locator defect — it was not "healed" by
  loosening the assertion.
