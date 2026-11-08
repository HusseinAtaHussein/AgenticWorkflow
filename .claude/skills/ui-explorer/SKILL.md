---
name: ui-explorer
description: Explores ONE selected module of a live web application at a time through the real browser UI ONLY — using Playwright MCP as the primary tool — and produces an evidence-based Markdown UI report for QA engineers, comparing actual UI behavior against an already-generated PRD. This skill NEVER explores, executes, or documents APIs, endpoints, network requests, payloads, Swagger/OpenAPI, Postman, HTTP methods, or status codes — UI ground truth only. Every execution asks for fresh login credentials, even if the module looks public or a session already seems to exist. Use whenever the user wants to verify one module's actual UI behavior (e.g. "explore the Dashboard UI", "check what PIM's UI actually shows vs the PRD", "validate Login screen behavior live"), or wants UI ground truth before writing test cases or automation for a module. Requires a project URL, a PRD Markdown file, and exactly one selected module — if any are missing, or the user wants API/network coverage or whole-app/multi-module exploration, ask them to narrow the request first. Not for generating the PRD itself (see prd-generator) and not for any API/network exploration (do not use this skill for that; it will refuse).
---

# UI Explorer

Produce a Markdown report of what **one module's UI** actually does — verified by real browser
observation, not by what the PRD claims and not by inference. QA engineers use this report as ground
truth for writing test cases and automation, so a single invented button or validation message
undermines the whole document. This skill is deliberately narrow on two axes: one module only, and UI
only — no API, network, or backend exploration of any kind, ever, even incidentally.

## Workflow

```text
Project URL + PRD + Selected Module
        ↓
Read PRD, identify selected module
        ↓
ASK USER FOR CREDENTIALS + SUBMISSION AUTHORIZATION (every single run — no exceptions)
        ↓
WAIT for response
        ↓
Log in via Playwright MCP, verify authentication actually succeeded
        ↓
Navigate to selected module only
        ↓
Discover every form, sub-section, and dropdown in the module (full inventory, not a sample)
        ↓
Explore module UI: navigation, structure, components, forms, validation
(empty + invalid/boundary input), full dropdown enumeration, tables,
search/filter, states, safe interactions, authorized success-state submission
        ↓
Compare every relevant item against the PRD
        ↓
Coverage self-check: confirm every discovered item was actually opened/tested
        ↓
Record discrepancies, blockers, evidence, confidence
        ↓
Verify no credentials/secrets leaked into the report
        ↓
Generate report → Output/UI_Exploration/<ModuleName>_UI_Exploration_Findings.md
```

## Step 0 — Collect exactly three inputs, and exactly one module

1. **Project URL** — ask if missing.
2. **PRD Markdown file** — ask if missing (e.g. `Output/PRD/Project_PRD.md`). Read it fully before
   exploring — it's the baseline every finding gets compared against, never proof that something exists
   in the live app. Never modify it.
3. **Selected module** — exactly one (e.g. `Dashboard`, `PIM`, `Login`, `Leave`). Hard boundary:
   - Vague requests like "explore the application" → ask for one specific module.
   - Multiple modules named → ask the user to pick one for this run; don't choose for them and don't
     explore more than one.
   - Only touch something outside the module as an unavoidable prerequisite (almost always: logging in
     via the login screen). Document that prerequisite explicitly, and don't explore it beyond what's
     needed — e.g. reaching Dashboard through Login does not license exploring Login's own validation,
     forgot-password flow, or error scenarios, unless Login itself is the selected module.

If all three are already clear from the user's message, don't re-ask.

## Step 1 — Authentication and authorization: ask everything up front, every single time

This is the rule most likely to get shortcut, so be explicit about what NOT to do: do not decide
authentication is unnecessary because the module looks public, because a session cookie already seems to
exist, because the login page didn't immediately appear, because the app auto-redirected to an
authenticated page, or because credentials were supplied in an earlier run or earlier in this
conversation. Every execution of this skill asks fresh, every time, no exceptions and no shortcuts based
on appearances.

Alongside credentials, this is also the one point in the run to ask the two authorization questions below.
Asking them here — before any exploration starts — means the rest of the run can proceed without stopping
mid-module to negotiate scope, and the user gives informed consent before anything with real consequences
happens.

Stop and ask, in spirit, this prompt (all three parts together, in one stop):

> Authentication is required to explore the website.
>
> Please provide the login credentials:
>
> Username:
> Password:
>
> The credentials will be used only for the current exploration session and will not be stored in any
> report, file, log, source code, configuration, screenshot, or generated artifact.
>
> Two more questions before exploring this module:
>
> 1. May I submit ONE valid record per distinct form type in this module, so the report can capture the
>    real success state (confirmation message, list update, redirect, etc.) instead of leaving it
>    unverified? If yes, should that submission happen on the project URL given above, or would you prefer
>    to point me at a separate disposable/sandbox URL for that step?
> 2. This module's main editable record (e.g. Personal Details or similar core/identity data) already
>    holds existing data. Save-time required-field testing on it means temporarily clearing real fields —
>    is that authorized for this run, and if so, should it run against a disposable/sandbox instance
>    rather than this live record?

Then:
1. Stop execution.
2. Wait for the actual response to all three parts.
3. Only continue into browser exploration after receiving it — never explore first and log in later,
   never explore with guesses in the meantime, and never treat silence on the two authorization questions
   as a "yes."

If the user declines or doesn't answer either authorization question, proceed with the rest of exploration
as normal, but record the resulting gap explicitly rather than silently skipping it — see Step 4 (core
record testing) and Step 6 (success-state reporting) for exactly how each gap gets written up.

Credential rules:
- Never guess, reuse from an earlier run, or fall back to default/example credentials unless the user
  explicitly supplies them as the credentials to use right now.
- Never retry a failed login with a guessed variation, and never brute-force.
- Use the credentials only to establish this session's browser login. Never write them, or any
  token/cookie/session ID/API key/Authorization header, into the report, a file, a log, source code,
  config, or a screenshot. Never print the password to terminal output.
- After submitting login, verify success from observable UI evidence — an authenticated page/dashboard
  appearing, a user menu or logout option appearing, the login form disappearing, authenticated
  navigation appearing — not merely "the login button was clicked." If login fails: record
  `Authentication Status: Failed`, do not proceed into the authenticated module, don't guess another
  password, and clearly record it as a blocker.
- If sensitive text or values accidentally surface in a screenshot or browser output, exclude that
  screenshot/content from the report rather than trying to redact and keep it.

## Step 2 — Explore with Playwright MCP, not assumptions

Playwright MCP is the primary and expected tool here — use it to open the URL, log in, wait for
rendering, navigate to the module, and interact (click, fill fields, open dropdowns, sort/filter tables,
expand sections, etc.), recording only what's actually observed. The live rendered UI is the source of
truth; the PRD is only the comparison baseline, never proof that something exists.

Treat the app as a possible SPA: a near-empty `<div id="app"></div>` or `<div id="root"></div>` in raw
HTML is not evidence the page is empty. Wait for JS to render and for activity to settle after
navigation/interaction, then inspect the actual rendered DOM before concluding anything is missing.

If Playwright MCP is unavailable, say so plainly rather than pretending live UI exploration happened, and
mark UI findings that couldn't be directly observed as `Not Verified` rather than converting PRD text into
observed fact.

### Full form coverage is required, not sampled

Every Add/Edit form belonging to the selected module must be opened and documented individually. If the
module has multiple sub-sections that each carry their own Add form — separate tabs, accordions, or
nested lists (e.g. a "Work Experience" tab and an "Education" tab that both live under one module, each
with their own Add button) — open and document every one of them, not a representative subset. A form
that looks structurally similar to one already covered is not evidence of what it actually contains.

**Anti-pattern to avoid:** never assume two forms share a field's type, options, or validation behavior
just because the forms share a label or the fields share a name. "Country" in one form and "Country" in
another may be a free-text field in one and a searchable dropdown with a different option set in the
other. Each form's schema must be independently opened and confirmed — a shared label is a hint to check,
never a substitute for checking.

### Full dropdown enumeration

Every dropdown encountered in the module must have its full option list captured, not just the first
handful of visible entries — open it and read through to the end. For dropdowns with more than roughly 20
options, summarizing is fine (first few options, last few options, and the total count), but the skill
must still open and scroll through the list to produce that summary rather than skipping it because it
looks long.

### Validation must include invalid and boundary input, not just empty submit

Empty-field submission alone under-tests a form — most real validation bugs live in what happens with a
value that's present but wrong. For every form in the module, in addition to empty required fields, also
attempt: one deliberately invalid value per field type (a malformed date, non-numeric text in a numeric
field, an over-length string in a bounded text field, an out-of-range number, etc.), and any cross-field
validation rules the form implies (OR-groups where at least one of several fields is required, fields that
become required only when another field has a certain value, mutually exclusive fields). This applies to
every form in the module, including the ones whose fields look simple enough that nothing seems worth
testing — a field that looks trivial is exactly where an untested edge case slips through.

## Step 3 — UI only: no API, network, or backend exploration, ever

This is a hard constraint, not a preference. Do not explore, execute, inspect, or mention in the report:
API endpoints, HTTP requests/responses, request or response payloads, Swagger/OpenAPI, Postman
collections, HTTP methods, status codes, headers, or any UI-to-API mapping. If browser network activity
happens incidentally during interaction, ignore it — don't let it leak into findings. The report describes
only what a user can see and do through the UI. If the user's request for this skill asks for API/network
coverage, that's out of scope for this skill — say so rather than partially complying.

## Step 4 — Respect safety boundaries throughout

Freely navigate, open menus/dropdowns, type safe test values, search, filter, sort, and open record
details — that's how real UI behavior gets observed.

Do **not** execute anything destructive unless the user has explicitly authorized it for this run:
permanent/bulk deletion, production data mutation, financial transactions, real bookings, sending real
messages, or changing critical account settings. When one is encountered:

1. Don't execute it.
2. Record it as `Not Executed — potentially destructive`, with a brief reason.
3. Continue with the rest of the module's safe functionality.

### Success-state submission depends on the Step 1 answer

Successfully submitting a form and watching what happens (confirmation message, list update, redirect) is
the only way to actually observe a success state — everything short of that is a guess about what success
looks like. That's why Step 1 asks up front whether submitting one valid record per distinct form type in
this module is authorized:

- **If the user authorized it**, submit exactly one valid record per distinct form type (not once per
  module and not once per every repeated instance of a similar form) on whichever URL they designated —
  the project URL or the disposable/sandbox URL — and record the observed success state as `Observed`
  evidence.
- **If the user declined or didn't answer**, do not submit valid data to capture a success state. Don't
  quietly leave the success-state fields blank or thin — write the named gap explicitly: `Success state:
  Not Observed — user did not authorize test-data submission` in both Section 9 (UI State Findings →
  Success State) and Section 13 (Blockers and Limitations) of the report. A visible, explained gap is
  correct; a silently-omitted one is not.

### Core/identity forms are not automatically exempt from Save-time testing

A module's main editable record (e.g. Personal Details, or any single record the module is essentially
"about") is not exempt from required-field-clearing tests just because it already holds real, existing
data — that exemption has to come from the user, not be assumed. Step 1 asks this up front, alongside the
success-state question:

- **If authorized**, run Save-time required-field testing on the core record the same way it would run on
  any other form — ideally against the disposable/sandbox instance if the user offered one — and restore
  or avoid persisting any field clearing that isn't reversed by canceling out of the form.
- **If declined or unanswered**, skip Save-time testing on that record, but record it as a named,
  explained gap (not a silent omission) in Section 13: `Required-field testing on <record name> — Not
  Executed — user did not authorize clearing fields on an existing record`.

## Step 5 — Track evidence and confidence as you go

For every finding, decide its bucket before writing it down:

- **Observed** — directly seen via live browser interaction just now.
- **Documented** — mentioned in the PRD or other docs, not independently verified live.
- **Inferred** — a reasonable conclusion from evidence, not directly confirmed.
- **Unknown** — not enough evidence either way.

Pair each with confidence: **High** (directly observed), **Medium** (reliable PRD/docs, not observed),
**Low** (inferred/indirect). Never phrase a Documented or Inferred claim as if it were Observed — "the
form displays 'Required field'" is only true if that exact message was actually seen. When something
can't be verified, write `Not Verified` or `Unknown` with a reason; that's a legitimate finding.

Compare each relevant item against the PRD, classified as **Confirmed / Partially Confirmed / Mismatch /
Additional Behavior / Not Verified / Blocked**.

If something blocks exploration (login failure, broken page, missing module, uninteractable element,
Playwright error, etc.), record it as a blocker with what was attempted, its impact, and what evidence
does exist — then continue with whatever else in the module is still reachable.

## Step 6 — Coverage self-check before writing the report

Before generating the report, do an internal inventory pass: list, module by module component by
component, every form, dropdown, and sub-section (tab/accordion/nested list) that was actually discovered
while navigating the module in Step 2. Then go down that list and confirm, item by item, that each one was
actually opened, enumerated, and tested — not merely noticed in passing.

Anything on the list that wasn't actually covered must appear as a named Blocker in Section 13, with a
reason that's honest about which of these it was:

- **Scoping choice** — deliberately out of scope for this run (e.g. it belongs to a different module).
- **Environment/tool failure** — Playwright couldn't reach it, it errored, or it never rendered.
- **User declined authorization** — the item required destructive/success-state/core-record authorization
  from Step 1 or Step 4 that wasn't granted.

The point of this step is that coverage gaps are visible and explained in the report, never silently
absent because nobody checked whether everything found got covered.

## Step 7 — Write the report

Use the exact structure in `references/report-template.md` (16 numbered sections, UI-only, module-scoped).
Fill every section from evidence actually gathered this run — an honestly thin section ("Not Verified —
no date pickers present in this module") is correct; a padded-out invented one is not.

Save to `Output/UI_Exploration/<ModuleName>_UI_Exploration_Findings.md` (e.g.
`Dashboard_UI_Exploration_Findings.md`), creating the directory if needed. Never overwrite or edit the
input PRD, source code, existing test cases, or automation framework — this skill only ever produces the
one new report file.

Before finalizing, scan the report yourself for anything resembling a credential, token, cookie, session
ID, API key, or authorization header, and remove it — cheap insurance against the one mistake that makes
the report unsafe to share. The only authentication-related line allowed in the report is
`Authentication Status: Successful / Failed / Blocked` — never the username or password.

See `references/ui-checklist.md` for the detailed checklist of what to inspect per module (navigation,
structure, components, forms, validation, tables, search/filter, states, safe CRUD).
