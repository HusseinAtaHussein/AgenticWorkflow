---
name: test-executor
description: Executes reviewed UI test cases (from a Test Design CSV, filtered to Valid in Scope = 1) against a live web application using Playwright MCP, and generates a Markdown execution report — following a user-supplied report template as the structural contract — with PASS/FAIL/BLOCKED statuses, evidence, integrated bug reports, and blocker tracking. Use whenever the user wants to actually run/execute reviewed test cases against the live app, e.g. "execute the Dashboard test cases", "run TC-001 through TC-020 against the live site and report results", or "give me an execution report with bugs for the reviewed PIM test design." Requires a project URL, PRD, UI Exploration findings file, a reviewed Test Design CSV containing a Valid in Scope column, and a Markdown execution report template — ask for whichever are missing. Every run asks for fresh login credentials, with no exceptions for an apparently-existing session. Strictly UI-only: never performs API execution, API testing, network/HTTP analysis, or database validation, even incidentally. Not for designing test cases (see test-designer) and not for UI-only exploration without execution (see ui-explorer).
---

# Test Executor

Run the test cases that already passed human review — and only those — against the real, live
application, then write down exactly what happened. This skill sits downstream of `ui-explorer` (UI
ground truth) and `test-designer` (test cases derived from that ground truth); its own job is narrower
and more literal than either: execute what's marked executable, record what's actually observed, and
never let the report say more than the evidence supports. A `PASS` that wasn't really checked, or a bug
report invented from a flaky locator, damages QA credibility more than an honestly incomplete report
does.

## Workflow

```text
Project URL + PRD + UI Exploration file + reviewed Test Design CSV + MD report template
        ↓
Read all four documents/template fully
        ↓
Filter CSV to Valid in Scope = 1 (scripts/execution_tools.py scope)
        ↓
ASK USER FOR USERNAME + PASSWORD (every single run — no exceptions)
        ↓
WAIT for response
        ↓
Log in via Playwright MCP, verify authentication actually succeeded
        ↓
If auth fails: mark every in-scope case BLOCKED, skip to report
        ↓
Execute each in-scope case: steps → observe → compare to CSV's Expected Result → PASS/FAIL/BLOCKED
        ↓
Investigate failures; open a bug only for a confirmed defect; distinguish bugs from blockers
        ↓
Compute metrics (scripts/execution_tools.py metrics) — never by hand
        ↓
Generate report using the supplied template's structure
        ↓
Verify no credentials/secrets leaked
        ↓
Save → Output/Test_Execution/<ModuleName>/<ModuleName>_Test_Execution_Report.md (+ Evidence/)
```

## Step 0 — Collect all five inputs before starting

1. **Project URL**
2. **PRD Markdown file** — read fully; gives requirement context for judging test design issues.
3. **UI Exploration Findings Markdown file** — read fully; the UI ground truth the test cases were built
   from.
4. **Reviewed Test Design CSV** — must contain a `Valid in Scope` column (plus the rest of the standard
   `test-designer` columns: TC ID, Module, Feature, Test Scenario, Test Type, Design Technique,
   Preconditions, Test Data, Steps, Expected Result, Priority, Severity, Source, Evidence Type,
   Confidence, Needs automation). If the user only has the `.xlsx` from `test-designer`, ask them to
   export/save it as CSV first — this skill's scope-filtering script expects CSV.
5. **Markdown execution report template** — read fully before generating anything. This template is the
   structural contract for the output: preserve its section order, heading hierarchy, and tables; fill
   its placeholders with real execution data; mark genuinely unavailable information `Not Available` /
   `Not Verified` / `N/A` rather than deleting the section or inventing content for it. See
   `references/template-handling.md` for the full rules on this.

Don't start browser execution until all five are in hand. If the user has already supplied everything
clearly, don't re-ask.

## Step 1 — Filter to the executable set — `Valid in Scope` is not negotiable

Run:

```text
py scripts/execution_tools.py scope <test_design.csv> <scope.json>
```

This reads the CSV, splits rows into `executable` (`Valid in Scope = 1`), `out_of_scope`
(`Valid in Scope = 0`), and `invalid_scope_value` (blank/anything else), and refuses to run if the CSV is
missing required columns, has a blank TC ID, or has duplicate TC IDs — fix the CSV problem and rerun
rather than working around it. It never modifies the source CSV.

This filter is authoritative, not a suggestion:
- Never execute a `Valid in Scope = 0` case, no matter how useful or clearly fixed it looks.
- Never execute a case with a blank/invalid scope value.
- Never change a row's `Valid in Scope` value yourself, even if you think the reviewer was wrong — that
  decision belongs to whoever reviewed the test design, not to this execution run.
- The `out_of_scope` and `invalid_scope_value` lists still need to appear in the report (counted, and
  listed as `NOT EXECUTED — OUT OF SCOPE`), they just never get run through the browser.

## Step 2 — Authentication is unconditional: ask every single time

Ask fresh, every run, regardless of whether the module looks public, a session cookie seems to already
exist, the login page didn't appear immediately, or credentials were supplied earlier in this
conversation or a prior run. No shortcuts based on appearances.

Stop and ask, in spirit, this exact prompt:

> Authentication is required to execute the test cases.
>
> Please provide the login credentials:
>
> Username:
> Password:
>
> The credentials will be used only for the current execution session and will not be stored in any
> report, file, log, source code, configuration, screenshot, or generated artifact.

Then stop, wait for the actual response, and only continue into browser execution afterward.

Credential rules: never guess, reuse from an earlier run, or use default credentials unless explicitly
supplied right now; never retry a failed login with a guess; never write the credentials or any derived
token/cookie/session ID/API key/Authorization header into the report, a file, a log, source code, config,
or a screenshot; never print the password to terminal output. Authenticate through the UI login form —
never via an API call or by injecting a session.

Verify success from observable UI evidence (authenticated page/dashboard appears, login form disappears,
user menu/logout appears) — not merely "the login button was clicked." If login fails: record
`Authentication Status: Failed`, mark every in-scope test case `BLOCKED` with the auth failure as the
recorded reason, do not guess another password, and proceed straight to generating the report with that
outcome — don't retry indefinitely.

## Step 3 — Execute each in-scope case, literally

For each case in the executable set, in order: read its TC ID, scenario, preconditions, test data, steps,
and expected result as written in the CSV — this is the execution contract, and it does not get silently
edited. Navigate and act exactly per its steps using Playwright MCP, observe the actual result, and
compare against the CSV's Expected Result (never a result you invent fresh during execution).

Handle dynamic UI properly: wait for the target page/module to actually be ready and the target element
to actually exist before acting; it's fine to retry a *technical* interaction (e.g. re-check after a
loading spinner clears) but never retry a *functional* action repeatedly just to force a PASS, and never
rewrite the test case to make it pass.

If a locator/element can't be found, don't jump straight to "application bug" — first rule out page not
loaded, wrong module, dynamic rendering delay, element in a modal/iframe, or an outdated test case (UI
structure changed since the test was designed). An outdated test case is a **Test Design Issue**, not an
application bug — record it as such rather than silently rewriting the case or misclassifying the result.

Assign exactly one status per case:
- **PASS** — observed UI behavior matches the CSV's Expected Result.
- **FAIL** — observed behavior differs from Expected Result, with sufficient evidence.
- **BLOCKED** — couldn't be completed due to an environmental/external limitation (auth failure, app
  unavailable, missing permission, missing required test data, browser/Playwright failure, unavailable
  prerequisite). A technical/environmental blocker is not automatically a product bug.

Actual Result must describe what was literally observed in the UI — "the loading indicator remained
visible and no results table appeared after the page finished loading," not "the backend failed to
process the request" (that assumes something never seen). See `references/status-and-bugs.md` for the
full PASS/FAIL/BLOCKED decision guide, bug-vs-blocker-vs-test-design-issue classification, and worked
examples.

Capture evidence for failures, confirmed bugs, notable blockers, and unexpected behavior. Save
screenshots under `Output/Test_Execution/<ModuleName>/Evidence/` with names like `TC-002_FAIL.png`,
`BUG-001.png`, `TC-003_BLOCKED.png` — never a screenshot containing credentials or secrets.

## Step 4 — Bugs: only for confirmed defects, never from a failure alone

A `FAIL` does not automatically become a bug. Before writing one, rule out invalid test data, a missing
prerequisite, an environment/permission/browser/Playwright issue, an outdated test case, or an
authentication problem as the real cause. Only a confirmed application defect gets a bug report.

Give each confirmed bug a unique sequential ID (`BUG-001`, `BUG-002`, ...), trace it to its failed test
case(s), and populate whatever bug fields the template supports (at minimum: Bug ID, Related Test Case,
Title, Module, Feature, Severity, Priority, Preconditions, Test Data, Steps to Reproduce, Expected
Result, Actual Result, Evidence, Environment, Status — new bugs are always `Status: New`; never claim a
bug is fixed without fresh evidence from this run showing it). If no bugs were found, say so explicitly —
"No confirmed application bugs were identified during this execution" — never imply the app is
defect-free beyond that.

## Step 5 — Compute metrics with the script, not by hand

Build `results.json` — `{"TC-001": "PASS", "TC-002": "FAIL", ...}` — covering every executable TC ID
(the script refuses to run if any is missing, or if it contains a status for a case that wasn't in
scope), then run:

```text
py scripts/execution_tools.py metrics <scope.json> <results.json> <metrics.json>
```

This computes passed/failed/blocked/not-executed counts, `pass_rate` (`passed / (passed+failed) × 100`,
excluding blocked from the denominator, `"N/A"` instead of dividing by zero), and `execution_rate`
(`(passed+failed+blocked) / valid_in_scope × 100`, `"N/A"` if there were zero in-scope cases). Use these
numbers verbatim in the report — don't recompute or round differently by hand.

## Step 6 — Generate the report against the supplied template

Follow `references/template-handling.md`: the template controls structure and presentation, the
execution evidence controls content — never bend one to fit the other. Populate execution overview
(project, URL, module, source file paths, execution date, browser, environment, authentication status —
never credentials, never duration you didn't measure), the execution summary table, detailed
per-test-case results (expected vs. actual, status, evidence, bug reference, notes), the bug summary and
details, the blocker summary (kept clearly distinct from bugs), evidence references, and a final QA
conclusion grounded only in this run's actual results — never a claim like "production ready" or
"defect-free" unless the evidence and requested criteria genuinely support it; prefer something like "the
selected in-scope test cases were executed as documented, except for the failures and blockers recorded
in this report."

## Step 7 — Final checks before saving

Scan the generated report and every evidence reference for accidental secrets (password, sensitive
username, token, cookie, session ID, API key, authorization header) and remove any found. Confirm: only
`Valid in Scope = 1` cases were executed; the source CSV, PRD, UI Exploration file, and template were not
modified; every executed case has exactly one status; bug IDs are unique and traceable; metrics match the
script's output; evidence paths are real files that exist; and the report contains no API/network/
database content anywhere.

Save to `Output/Test_Execution/<ModuleName>/<ModuleName>_Test_Execution_Report.md`, creating the
directory (and its `Evidence/` subfolder) if needed. Then report to the user: output path, execution
date, counts (total / valid in scope / out of scope / passed / failed / blocked), pass rate, execution
rate, bug count, and blocker count — never credentials.
