---
name: test-designer
description: Reads a UI Exploration Markdown report (produced by the ui-explorer skill) and transforms its verified UI findings into a structured, evidence-based set of software test cases, saved as a formatted Excel (.xlsx) workbook under Output/Test_Design/. Use whenever the user wants test cases, a test design, or a test matrix generated from a UI exploration report, e.g. "turn the Dashboard exploration findings into test cases", "generate test cases for PIM from the exploration report", or "build a test case Excel sheet from Output/UI_Exploration/Login_UI_Exploration_Findings.md". Requires exactly one UI Exploration Markdown file as input — if none is given or multiple are given, ask the user to specify exactly one. Do not invent UI behavior, validation rules, or expected results beyond what that file actually documents; if the exploration file itself looks thin or unverified, the resulting test suite should be equally honest about that, not padded out. Not for writing the exploration report itself (see ui-explorer) and not for API test design (the exploration reports this skill reads are UI-only, so nothing here covers APIs either).
---

# Test Designer

Turn one UI Exploration Markdown report into a QA-ready Excel test suite. The exploration report is the
only source of truth here — it already did the hard work of separating what was actually observed in the
browser from what's merely documented, inferred, or unverified. This skill's job is to carry that same
evidence discipline forward into test cases, not to fill gaps with plausible-sounding assumptions. A test
case that asserts behavior nobody verified is worse than no test case: it gives false confidence and
wastes a tester's time chasing a "failure" that was never real behavior to begin with.

## Step 0 — Get exactly one UI Exploration file

Ask for the path if not given, e.g. `Output/UI_Exploration/Dashboard_UI_Exploration_Findings.md`. If the
user names more than one, ask them to pick exactly one for this run — don't merge modules into a single
suite. The module name in that file becomes the module for every test case you generate; don't rename it.

## Step 1 — Read the whole file before designing anything

Read the full report, not just the summary. Pull out everything with test-case potential: navigation,
page structure, every UI component (buttons, fields, dropdowns, tables, modals, etc.), forms and their
validation, search/filter/sort/pagination, UI states, safe interactions and CRUD, the PRD Validation
table, Additional Observed Behavior, and Blockers. Also note the report's own evidence labels (Observed /
Documented / Inferred / Unknown) and PRD classifications (Confirmed / Partially Confirmed / Mismatch /
Additional Behavior / Not Verified / Blocked) for each item — you'll carry these forward, not overwrite
them with your own guess.

## Step 2 — Design test cases strictly from that evidence

Every test case must trace to something the report actually says: an Observed behavior, a Documented
finding explicitly named in the report, or a straightforward logical variation of one of those (e.g. the
report observed a required-field error on submit → a negative test for that same field with a different
invalid value is a fair derivation). Never invent a button, field, dropdown option, validation rule,
error message, business rule, role, permission, or expected result that isn't in the report.

Treat the report's own uncertainty as binding:
- `Not Verified` → do not write a test case that asserts the behavior works; if worth tracking, write a
  test case that verifies only what's actually checkable (e.g. "dropdown opens and shows options"), not
  the unverified part.
- `Unknown` → do not guess at the behavior.
- `Blocked` → do not write a test case assuming the blocked functionality works. You may write a test
  case that documents the blocker itself, sourced explicitly as "UI Exploration — Blocker."
- `Mismatch` / `Partially Confirmed` → write the test case against the actual observed UI behavior, not
  the PRD's claim.

Apply test design techniques where the evidence actually supports them — positive testing, negative
testing (only where the report shows evidence validation exists), boundary value analysis (only around
boundaries the report actually documents, never invented numbers), equivalence partitioning, decision
tables (for multiple observed conditions), state transition testing (for states the report names:
loading/empty/error/disabled/etc.), careful error guessing grounded in what was observed, and UI
interaction testing (click/select/search/filter/sort/paginate/tab/expand/submit/cancel/clear). See
`references/test-design-guide.md` for when each technique applies and worked examples — read it before
generating cases if you're unsure which technique fits a given finding.

Cover the module comprehensively but only where there's something to cover — don't force a test case into
an area the module doesn't have (e.g. no pagination section in the report means no pagination test
cases). Avoid near-duplicate scenarios that differ only in wording; instead split them into genuinely
distinct coverage (e.g. valid input / empty input / invalid input / clear, each only if the report
evidences that scenario).

## Step 3 — Fill in every field per test case

Each test case needs: `tc_id` (sequential `TC-001`, `TC-002`, ... — stable and unique), `module` (from
the report), `feature` (the report's own naming — don't rename `Country POS` to `Location Filter`),
`test_scenario`, `test_type` (Functional / UI / Validation / Negative / Boundary / etc.),
`design_technique` (EP / BVA / Decision Table / State Transition / Positive / Negative / etc.),
`preconditions` (concise and realistic — only include auth/role prerequisites the report actually
supports), `test_data` (use an actual value only if the report observed it as a real option, otherwise a
descriptive placeholder like "Valid Country POS option" — never invent a concrete value or use real
credentials), `steps` (sequential, specific, executable — never "test the feature" or "verify it works"),
`expected_result` (only observable UI behavior; no backend/API/database claims unless the report
explicitly documents them), `priority` (High/Medium/Low — not everything is High; reserve High for core
workflow/critical validation), `severity` (Critical/Major/Minor/Trivial, based on impact if it fails, not
copied from priority), `source` (which report section/finding this came from), `evidence_type`
(Observed/Documented/Inferred — never claim Observed for something you derived), `confidence`
(High/Medium/Low), `valid_in_scope` (1 or 0 — 0 only when the case turns out unsupported/out of
scope/unverifiable, which you should generally avoid generating in the first place rather than generating
and marking 0), and `needs_automation` (1 or 0 — 1 for repeatable, deterministic UI workflows;
0 for visual judgment, one-time destructive scenarios, or anything needing human judgment).

## Step 4 — Self-check before generating the file

Before building the workbook, verify: every case traces to the module and to real report evidence; no
API/network content anywhere; no invented behavior, validation, or business rules; no duplicates; steps
are executable and expected results are observable; priority/severity are varied and reasonable;
evidence_type and confidence are honest; `valid_in_scope` and `needs_automation` are strictly `1`/`0`
(never yes/no/true/false); and — critically — no credentials, tokens, cookies, session IDs, API keys, or
authorization headers appear anywhere in any field. If the source report referenced authentication, use
a safe description like "Authenticated user" or "Valid authenticated session," never actual credentials.

## Step 5 — Build the workbook with the bundled script

Don't hand-build the Excel formatting — write a JSON payload and run the script, which applies consistent
formatting and computes the Summary sheet directly from the test case list (so the numbers are always
correct, never manually re-typed):

```text
py scripts/build_xlsx.py <payload.json> "Output/Test_Design/<ModuleName>_Test_Cases.xlsx"
```

Payload shape — `{"module": ..., "source_file": ..., "test_cases": [ {tc_id, module, feature,
test_scenario, test_type, design_technique, preconditions, test_data, steps, expected_result, priority,
severity, source, evidence_type, confidence, valid_in_scope, needs_automation}, ... ]}`. Write the payload
to a temp JSON file first (your scratch directory), then invoke the script. The script will:
- refuse to run (nonzero exit, clear error) if a field is missing, an enum field has an invalid value, a
  TC ID is duplicated, or `valid_in_scope`/`needs_automation` isn't `0`/`1` — fix the payload and rerun
  rather than working around the error;
- refuse to run if it detects secret-looking content in any field (password/token/api key/etc. markers)
  — this is a safety net, not a substitute for your own check in Step 4;
- create `Output/Test_Design/` if it doesn't exist;
- produce a workbook with a "Test Cases" sheet (frozen header row, autofilter table, wrapped text, sized
  columns) and a "Summary" sheet with counts computed from the actual rows;
- print a JSON summary (`total_test_cases`, `valid_in_scope`, `needs_automation`, `manual_only`) you can
  use directly in your final report to the user, so those numbers are guaranteed to match the file.

If `openpyxl` isn't installed, install it first (`pip install openpyxl`) — do not fall back to writing
CSV or Markdown instead; the deliverable must be a real `.xlsx` file.

## Step 6 — Report the result

Tell the user the module, the source exploration file, the output path, and the counts from the script's
JSON output (total, manual only). Never include any credential or
secret in this summary either.
