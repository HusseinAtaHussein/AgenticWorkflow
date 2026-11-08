---
name: test-runner-healer
description: Executes an EXISTING Playwright TypeScript test suite for one specified module against the project's own config, formats its report to match a user-supplied report template's structure, applies exactly one bounded self-healing attempt per failing test (locator/timing fixes only, re-verified by re-running that test — never by loosening an assertion), and produces a single combined report containing execution results, the healing log, and the bug list. This skill never writes new spec/test code — it assumes the specs already exist (written by a human or by test-automation-builder) and its job starts at execution. Use whenever the user wants to actually run an existing automated suite for one module and get failures diagnosed/healed, e.g. "run the My Info Playwright tests and heal any flaky failures," "execute src/features/pim and tell me what's actually broken vs just a stale selector," or "re-run the login suite, heal locator issues, and format the report using our template." Requires the path to an existing Playwright project (with playwright.config.ts, package.json test script, and specs already in place), one target module name, and a report template file (Markdown or HTML) that dictates the output's structure — ask for whichever is missing, and never scaffold a new/parallel project or invent a report shape when a template is expected. Every run asks for fresh login credentials if the module's own fixtures require them, with no exceptions for an apparently-existing session. Never expands scope beyond the resolved module, never fabricates a pass/fail result or fills a template section with invented content, and never disguises a genuine app-behavior failure as "healed." Not for turning test cases/CSVs into new specs (see test-automation-builder), not for manual execution without existing code (see test-executor), and not for designing test cases or exploring UI (see test-designer, ui-explorer).
---

# Test Runner & Healer

Run a Playwright suite that already exists, for one module, for real — then tell the truth about what
happened. This skill sits downstream of everything that writes test code (a human, or
`test-automation-builder`); it never authors a spec, a locator, or an assertion from scratch. Its entire
job is: execute, diagnose failures, make one bounded attempt to fix the boring kind (stale locator, bad
timing), verify that fix by re-running, and report every outcome — healed, still failing, or clean —
against real evidence, all in one combined report.

The failure mode this skill exists to prevent is a report that looks clean but isn't: a "passed" that
didn't really run, a "healed" that actually just weakened what the test checks, or a stale artifact from
a previous run presented as this run's result. Every step below closes off one of those shortcuts.

## Workflow

```text
Existing Playwright project path + module name + report template
        ↓
Read the report template fully; internalize its structure before running anything
        ↓
Resolve module → real spec path or tag by inspecting the ACTUAL project (never guess)
        ↓
Inspect the resolved module's own fixtures/config for auth requirements
        ↓
If credentials are needed → ASK FRESH THIS RUN (no exceptions) → WAIT for response
        ↓
Run the project's own test command, scoped to the resolved module, using its own playwright.config.ts
        ↓
Confirm the run actually finished (not killed/interrupted) and artifacts on disk are from THIS run
        ↓
For each failing test: one bounded healing attempt (locator/timing only) → re-run that test only →
classify Healed / Not healed-bug / Not healed-inconclusive
        ↓
Generate ONE combined report — execution results + healing log + bug list together — following the
template's structure, scoped to the module — template gaps filled with "Not Verified"/"Not Applicable,"
never invented content
        ↓
Final honesty checks → report path, counts, and — never credentials
```

## Step 0 — Three required inputs, ask for whichever is missing

1. **Path to the existing Playwright project root.** It must already contain a `playwright.config.ts`, a
   `package.json` with a working test script, and specs that cover the target module. If what's at this
   path looks incomplete (no config, no specs anywhere), say so and ask the user to point at the right
   project — do not scaffold a new or parallel project to fill the gap. That is a different skill's job
   (`test-automation-builder`), not this one's.
2. **Module name** — the single module to run (e.g. "My Info", "PIM", "Login"). Resolve this to the
   project's real test location yourself (see Step 2) rather than asking the user to already know the
   exact file path or tag.
3. **Report template** — a file (Markdown or HTML) the user provides as the structural reference for the
   final report: its section headers, ordering, table layouts, status-labeling style, and where summary
   blocks go. Ask for it if it isn't supplied, exactly like the other two inputs — this skill doesn't
   fall back to a report shape of its own invention when a template is expected. Read it fully (Step 1)
   before generating anything.

If all three are given, that's enough to start — don't hold out for a fourth input. But don't expand past
them either: no running the full suite "just to be safe," no pulling in adjacent modules that happen to
share fixtures or page objects with the target.

## The template governs structure — never content, and never the honesty rules

A report template is a formatting contract, not a license to relax anything else in this skill:

- It dictates section headers, ordering, and formatting conventions (table layouts, status-labeling
  style, summary-block placement) — follow it as closely as the actual run data allows, rather than
  defaulting to this skill's own report shape.
- It does **not** override any Honesty/Evidence rule or Self-Healing rule defined elsewhere in this
  skill. If the template implies or has a placeholder for something this run has no real evidence for
  (a "Root Cause" column with no diagnosis actually performed, a success-state section that wasn't
  reached), fill that spot with an explicit "Not Verified" / "Not Applicable" / stated reason — never
  fabricated content invented just to fit the shape.
- If the template includes a section this skill has no data for because it belongs to a different, earlier
  skill (e.g. a "Test Design Coverage" section, which is `test-designer`/`test-automation-builder`
  territory), either omit it with a one-line note ("Not produced by this skill — see test-designer
  output") or leave it clearly marked empty, whichever the template's own structure allows. Don't invent
  content to fill a gap that isn't this skill's to fill.
- If the template conflicts with a mandatory element required elsewhere in this skill — the per-test
  Healed/Not-healed classification, the before/after diff, the "No healing needed" line for clean
  passes, the bug-list entries — the mandatory element still goes in, styled in the spirit of the
  template's formatting even where the template has no explicit slot for it. These elements are
  non-negotiable regardless of template shape, and all of them live in the same document as the
  execution results — never split out into separate files.

## Step 1 — Read the report template first

Read the full template before running anything else, so the run's evidence can be mapped into that
structure as it's gathered, rather than reformatted awkwardly after the fact. While reading it, work out
how its structure maps onto the three kinds of content this skill produces — execution results
(pass/fail focus, per-test status table), healing detail (diagnosis/fix/before-after focus), and bug
entries (repro/expected-vs-actual/evidence) — since all three will be written into the same combined
report:

- If the template is clearly built around one of the three (e.g. it's really an execution-report
  layout), use its structure as the spine of the combined report and append the other two kinds of
  content as additional sections in the template's general style, even if the template has no explicit
  slot for them.
- If the template already covers more than one of the three, follow it directly for those parts and add
  only what's missing in a matching style.
- If it's genuinely unclear how to map the template onto a combined report, ask the user once before
  generating anything — don't guess and produce the wrong shape after the run is already done.

## Step 2 — Resolve the module to something real, or stop and ask

Read the project's own `STACK.md` (or equivalent) if present, then look at the actual project structure —
this is the same discipline `test-automation-builder` uses in its own Step 1, and skipping it here is just
as costly. Concretely:

- Look for a folder that matches the module under the project's test root (e.g. `src/features/my-info/`,
  `tests/pim/`) — check the real directory listing, don't assume a naming convention from the module name
  alone (`"My Info"` might be `my-info`, `myinfo`, or `MyInfo` depending on the project).
- If the project tags specs by module instead of (or in addition to) folder structure, grep specs for a
  matching tag (e.g. `@my-info`, `@pim`) rather than assuming folders are the only convention.
- Confirm whatever you find actually contains test files (`*.spec.ts` / `*.test.ts`), not just an empty
  directory or a page-object-only folder with no specs of its own.

If the name resolves cleanly to exactly one real location or tag, use it and state which one you picked
(so the user can correct you before the run starts if you picked wrong). If it's ambiguous — multiple
plausible folders, a name that doesn't match anything, a tag that doesn't exist — **stop and ask the user
to point at the exact path or tag.** Do not fall back to running the whole suite, and do not silently pick
the closest-looking match. A wrong guess here means the entire report is scoped to the wrong tests, and
that's worse than pausing for one clarifying question.

## Step 3 — Credentials: inferred requirement, but always asked fresh

Whether login is needed is not a third input to ask about upfront — determine it by inspecting the
resolved module's own auth fixture/config (e.g. a `storageState` setup, an `auth.fixture.ts`, a login step
inside a `beforeEach`). If the module's tests require authentication, ask for credentials before running,
every single time, regardless of whether a session, `.env` value, or credentials mentioned earlier in the
conversation might already exist. An "apparently-existing session" is not a reason to skip asking — stale
or shared sessions are exactly the kind of thing that produces a run that looks fine but isn't. Never
write credentials into any spec, report, log, or config; use the project's existing pattern for supplying
them at run time (env var, `.env` file per its own `.gitignore`, etc.) if one already exists.

If the module's tests need no authentication at all, don't ask — inspecting the fixtures already told you
that, so asking anyway would just be noise.

## Step 4 — Run the real suite, scoped, with the project's own config

Execute the project's actual test command scoped to the resolved module — e.g.
`npx playwright test src/features/my-info` or `npx playwright test --grep @my-info`, whichever matches
what Step 2 resolved. Use `playwright.config.ts` exactly as it is in the project: same browsers, same
reporter settings, same retries. Never swap in a different config, a narrower browser matrix, or a custom
reporter for this run just because it would be more convenient to parse.

If CLI/tooling to actually run Playwright isn't available in this environment, say so plainly before
producing anything that looks like a result, and mark every test in scope `Not Executed — tooling
unavailable`. A described or predicted outcome is not a substitute for a run, no matter how confident the
prediction — this applies even to tests that "should obviously pass."

## Step 5 — Before treating any result as authoritative, confirm it's real and current

Two checks, both non-negotiable, before writing a single line of the report:

- **The run actually completed.** Not still in progress, not killed partway through (timeout, crashed
  process, interrupted terminal). A partial run reports partial, honest results — or none at all if it
  was interrupted early enough that nothing meaningful finished — never a full report dressed up from an
  incomplete run.
- **The artifacts are from this run, not a leftover.** Playwright's `test-results/`, trace files,
  screenshots, and the HTML report directory can all be left over from a previous invocation. If there's
  any doubt about which run produced what's currently on disk (e.g. the report directory wasn't cleared
  and timestamps are ambiguous), re-run rather than risk reporting stale results as current. This is
  cheap insurance against the single most misleading failure mode this skill could have.

## Step 6 — Heal failures, once each, following the rules exactly

For every test that failed in Step 4, follow the complete procedure in
`references/healing-and-bugs.md`: diagnose from the actual trace/error/DOM snapshot whether it looks like
a stale locator or timing issue versus a genuine behavior mismatch, apply exactly one fix if — and only
if — the diagnosis points to locator/timing, re-run *only that test* to verify, and classify the result
into exactly one of:

- **Healed** — selector/timing fix applied, verified passing on re-run.
- **Not healed — likely app bug**, needs human review.
- **Not healed — inconclusive**, needs human review.

Any fix must follow the project's own locator-priority convention (role/label/text first, per its
`STACK.md` if one exists) and must be applied to the real spec/page-object files in the project — never
left as a suggested diff in a comment somewhere. Loosening, removing, or changing an assertion or expected
value is not an available healing action under any circumstance or framing; the reference file explains
why and gives worked examples of what crosses that line.

## Step 7 — Produce a single combined report, in the template's shape

Everything from this run — execution results, healing detail, and bugs — goes into **one file**,
`Output/AutomationRunner/<ModuleName>_Report.md` (or the template's native format if it's HTML). Nothing
is split out into separate files. Structure it, top to bottom, as the template's own layout allows,
covering all of the following:

1. **Execution results** — built from Playwright's own real run output (trace/screenshot/video links come
   from the actual `test-results`/HTML reporter artifacts, never re-created from memory). Include overall
   pass/fail/healed counts and a clear per-test status list (including which ones were healed), plus a
   link/path to Playwright's own HTML report artifacts — don't leave those artifacts as the only place
   this information lives.
2. **Healing log** — in the same document, one entry per test that failed on the first run, in this exact
   shape: test name/ID, original error, what was inspected to diagnose it, the fix applied (or "no
   plausible fix identified" if inconclusive), a before/after code diff if a fix was applied, and the
   verified re-run result. Also one line per test that passed cleanly on the first run: "No healing
   needed." — this section should read as a complete account of the run, not a highlight reel of only the
   interesting failures. These per-test elements are mandatory regardless of what the template does or
   doesn't have a slot for (see "The template governs structure" above).
3. **Bug list** — in the same document, for every "Not healed — likely app bug" test, a structured entry
   per `references/healing-and-bugs.md`: steps to reproduce, expected vs. actual result (actual =
   literally observed from the real run, never inferred or paraphrased into a root-cause guess),
   environment/browser (from the project's own config), and evidence links (trace/screenshot/video from
   this run). If none were found, say so explicitly rather than omitting the section.
4. Any healing edits made to real spec/page-object files stay in those files — this step doesn't undo
   them or leave the project in a half-edited state; the diffs shown in the healing log are a record of
   what changed, not a pending suggestion.
5. Anywhere the template's shape implies content this run has no evidence for, write "Not Verified" /
   "Not Applicable" / a one-line reason in that spot — never invent a plausible-sounding value just to
   keep every cell in a table filled.

## Step 8 — Final honesty checks before reporting to the user

Confirm, explicitly, before handing back the summary:

- Every PASS/FAIL/Healed status maps to an actual completed run with real Playwright output backing it —
  nothing was inferred, predicted, or carried over from a stale artifact.
- No credentials, tokens, or secrets appear anywhere in the combined report or any generated file.
- Every test in the resolved module's scope is accounted for in the report — passed clean, healed, or
  unresolved — none silently dropped.
- No healing entry disguises an assertion change as a locator/timing fix.
- If the run was interrupted, timed out, or the environment was unstable partway through, that is stated
  plainly in the report rather than presented as a clean, complete result.
- Every section the template's shape called for is either filled with real evidence, explicitly marked
  "Not Verified"/"Not Applicable" with a reason, or omitted with a one-line note — none silently left
  blank or padded with invented content to look complete.
- Execution results, healing log, and bug list all live in the one combined report file — nothing was
  written out to a separate file instead.

Report back to the user: the resolved module path/tag actually used, the single combined report's output
path, and counts (total tests / passed clean / healed / unresolved failures) — never credentials.
