---
name: test-automation-builder
description: Turns human-reviewed test cases (from a Test Design CSV, filtered to Valid in Scope = 1 AND Needs automation = 1) into real, runnable Playwright TypeScript specs inside an EXISTING Playwright/IntelliJ project — following that project's own STACK.md conventions for page objects, fixtures, folder structure, and tagging — then actually executes them with `npx playwright test`, performs one bounded self-healing attempt per failing test on likely stale locators, and produces an HTML execution report with an embedded/linked healing log and structured bug entries. Use whenever the user wants reviewed manual test cases turned into automation and run, e.g. "automate the in-scope PIM test cases and run them," "generate Playwright specs from this reviewed test design CSV and execute them in the project," or "build the automation for TC-010 through TC-030 and give me a report with any failures healed or flagged." Requires a project URL, PRD, UI Exploration findings file, a reviewed Test Design CSV with Valid in Scope and Needs automation columns, a STACK.md (or equivalent) describing the target project's conventions, and the path to the existing Playwright project — ask for whichever are missing. Every run asks for fresh login credentials, with no exceptions for an apparently-existing session. Never generates a standalone/parallel Playwright project, never fabricates execution results, and never disguises a failure by loosening an assertion. Not for designing test cases (see test-designer), not for manual UI-only execution without generated code (see test-executor), and not for UI exploration itself (see ui-explorer).
---

# Test Automation Builder

Turn the test cases a human has already reviewed and marked automatable into real Playwright code inside
the team's actual project, run that code for real, and report exactly what happened — including the
messy parts (stale locators, genuine bugs, things that couldn't be verified). This skill sits downstream
of `ui-explorer` (UI ground truth), `test-designer` (test cases derived from that ground truth), and a
human reviewer (who decided which cases are both in scope and worth automating). Its own job is narrow:
generate code that traces back to a real CSV row and real observed UI behavior, execute it for real, heal
what's cheaply healable, and never let the report claim more than the evidence supports.

The single biggest risk with a skill like this is quietly inventing things: a selector for an element
nobody verified exists, a "pass" for a test that didn't really run, a "fix" that's actually just a
weakened assertion. Every step below exists to close off one of those shortcuts.

## Workflow

```text
Project URL + PRD + UI Exploration file + reviewed Test Design CSV + STACK.md + Playwright project path
        ↓
Read all inputs fully; inspect the ACTUAL target project (page objects, fixtures, config)
        ↓
Filter CSV to Valid in Scope = 1 AND Needs automation = 1 (scripts/automation_tools.py scope)
        ↓
Cross-check each in-scope row against the UI Exploration findings — flag undocumented behavior as a
blocker instead of guessing
        ↓
ASK USER FOR USERNAME + PASSWORD (every single run — no exceptions)
        ↓
WAIT for response
        ↓
Generate specs (+ extend page objects/fixtures) inside the existing project, one CSV row ↔ one test,
tagged and annotated per STACK.md
        ↓
Run `npx playwright test` (or the project's own script) for real
        ↓
For each failure: one bounded healing attempt (locator/timing only, never assertions) → re-run that
test only → classify Healed / Not healed-bug / Not healed-inconclusive
        ↓
Generate HTML execution report (Playwright's own reporter, or equivalent) + separate healing log +
bug entries
        ↓
Verify no credentials/secrets leaked; verify every reported result maps to a real run
        ↓
Save → project's own spec locations + Output/Automation/<ModuleName>_Healing_Report.md (+ report path)
```

## Step 0 — Collect all six inputs before starting

1. **Project URL**
2. **PRD Markdown file** — read fully; gives requirement context for judging ambiguous rows.
3. **UI Exploration Findings Markdown file** — read fully. This is the ground truth for whether a
   selector/behavior a CSV row references was actually observed — see Step 2.
4. **Reviewed Test Design CSV** — must contain `Valid in Scope` and `Needs automation` columns (plus the
   rest of `test-designer`'s standard columns: TC ID, Module, Feature, Test Scenario, Test Type, Design
   Technique, Preconditions, Test Data, Steps, Expected Result, Priority, Severity, Source, Evidence
   Type, Confidence). `test-designer` produces `.xlsx`; if that's what the user has, ask them to
   export/save the reviewed sheet as CSV first — this skill's scope script expects CSV.
5. **STACK.md or equivalent** — the target project's own description of folder structure, naming
   conventions, fixture patterns, locator priority, and tagging conventions. This document sets intent;
   Step 1 still requires reading the real files, since a project can drift from its own doc.
6. **Path to the existing Playwright/IntelliJ project root** — where generated specs and any new/extended
   page objects and fixtures must live. Never scaffold a new, separate Playwright project — this skill
   only ever adds to what's already there.

Don't start generating code until all six are in hand. If the user has already supplied everything
clearly, don't re-ask.

## Step 1 — Learn the real project before writing a single line

Read `STACK.md`, then open the actual project: `playwright.config.ts`, `tsconfig.json`, `package.json`
scripts, and existing specs/page objects/fixtures for the module(s) involved. See
`references/spec-generation-guide.md` for the full detail on this step, extending existing page objects
instead of duplicating them, and the locator-priority approach to use. Skipping this step is the most
common way this kind of skill produces code that looks right but doesn't fit the project — don't skip it
even under time pressure.

## Step 2 — Filter to the automatable set, and don't silently drop the rest

Run:

```text
py scripts/automation_tools.py scope <test_design.csv> <scope.json>
```

This splits rows into `automate` (`Valid in Scope = 1` AND `Needs automation = 1`), `not_automation`
(in scope but not flagged for automation — not this skill's job), `out_of_scope`
(`Valid in Scope = 0`), and `invalid_value` (either column blank or not `0`/`1`). It refuses to run on a
CSV missing required columns, a blank TC ID, or duplicate TC IDs.

This filter is authoritative:
- Never generate a spec for a row that isn't in `automate`, no matter how easy it looks.
- Never change a row's `Valid in Scope` or `Needs automation` value yourself — that decision belongs to
  the human reviewer.

Then, for every row in `automate`, cross-check it against the UI Exploration Findings file: does the
report actually document (as `Observed`, or at minimum a clearly named `Documented` item) the
field/button/message/state the row's steps and expected result reference? If not — the row references
something the exploration report never verified — do **not** invent a selector or guessed behavior to
cover the gap. Instead, add the row to a **Blocked — Not Automated** list with the specific reason (e.g.
"references a 'Save Draft' button not mentioned anywhere in the exploration findings").

Every row that isn't generated into a spec — whether `not_automation`, `out_of_scope`,
`invalid_value`, or newly blocked here — must appear explicitly in the final report with its reason.
Nothing gets silently dropped.

## Step 3 — Authentication is unconditional: ask every single time

Same rule as `ui-explorer` and `test-executor`, no exceptions for an apparently-existing session, a
public-looking module, or credentials supplied earlier in this conversation.

Stop and ask, in spirit, this exact prompt:

> Authentication is required to run the automation against the live application.
>
> Please provide the login credentials:
>
> Username:
> Password:
>
> The credentials will be used only for this run and will not be stored in any spec file, report, log,
> config, screenshot, or generated artifact.

Then stop, wait for the actual response, and only continue afterward. Never hardcode credentials into a
generated spec file — read them from the project's existing env/config/fixture pattern (per STACK.md) if
one exists, or from an environment variable passed at execution time; never commit them to source.

## Step 4 — Generate specs that trace back to a real row and real evidence

Follow `references/spec-generation-guide.md` in full. In short: one CSV row maps to one test (or one
clearly-labeled block within a shared spec file, matching the project's own file-organization pattern),
annotated with its `TC ID`; locators and expected text come only from what the UI Exploration findings
document, never invented; destructive/data-mutating actions are skipped and blocker-listed unless the CSV
or user explicitly authorized them for this environment; tags follow the project's existing convention.

## Step 5 — Execute for real

Run the project's actual test command (`npx playwright test`, or whatever `package.json` defines) against
the newly generated specs, respecting the existing `playwright.config.ts` — never a parallel/duplicate
config, never a different browser/reporter setup invented for this run. Let Playwright produce its own
trace/screenshot/video artifacts; these are the only basis for the report, not a description of what
should have happened.

If IntelliJ/CLI execution is unavailable in this environment, say so plainly and stop before claiming any
result — mark every affected test `Not Executed — tooling unavailable` rather than fabricating pass/fail
outcomes.

## Step 6 — Heal failures, once each, bounded

For every test that fails on this first run, follow the full procedure in
`references/healing-and-bugs.md`: diagnose whether it looks like a stale locator/timing issue versus a
real behavior mismatch, attempt exactly one locator/timing fix if plausible, re-run only that test, and
classify the result as one of:
- **Healed — selector fix applied, now passing**
- **Not healed — likely app bug, needs human review**
- **Not healed — inconclusive, needs human review**

Never loosen an assertion or expected value to force a pass — that path is closed entirely, not just
discouraged. Never report a healed test as if it had passed cleanly on the first attempt; the report shows
the original failure, the diagnosis, the fix, and the verified re-run as separate, visible facts.

## Step 7 — Bug entries for what healing didn't resolve

For every unresolved failure, write a structured bug entry per `references/healing-and-bugs.md`: steps to
reproduce (from the CSV), expected vs. actual result (actual = literally observed, not inferred),
environment, evidence links (trace/screenshot/video from the real run), and the source `TC ID`. If no bugs
were found, say so explicitly rather than omitting the section.

## Step 8 — Produce the outputs

1. **Generated code**, committed into the existing project's real structure per STACK.md (e.g.
   `src/features/<module>/`) — never a new top-level location. Include any new/extended page objects or
   fixtures alongside the specs they support.
2. **HTML execution report** — Playwright's own HTML reporter output is the default choice, since it's
   generated from the actual run and already includes trace/screenshot/video links; include or link the
   healing log and bug entries from it (e.g. a short custom summary page linking to both), don't leave the
   report as raw pass/fail with the healing and bug context living only in a separate file nobody finds.
3. **Healing log** — `Output/Automation/<ModuleName>_Healing_Report.md`, one entry per test that failed on
   first run **and** one line per test that passed cleanly on first run stating "No healing needed" (so
   the log is a complete account of the run, not just the interesting failures).
4. **Blocked/skipped list** — every row from Step 2 that didn't get a spec, with its reason, included in
   the final report (not just mentioned in passing to the user).

## Step 9 — Final honesty checks before reporting to the user

Confirm: every reported PASS/FAIL/Healed status corresponds to an actual executed run with real
Playwright output backing it; no credentials/tokens/secrets appear in any generated spec, report, log, or
screenshot; the source CSV, PRD, UI Exploration file, and STACK.md were not modified; every generated spec
file has a visible TC ID annotation; every skipped/blocked CSV row is listed with a reason; and no healing
entry disguises an assertion change as a locator fix.

Report to the user: output paths (specs, HTML report, healing log), counts (total in-scope-for-automation
/ generated / passed first try / healed / unresolved failures / blocked-not-automated), and — never
credentials.
