---
name: prd-generator
description: Generate a complete, evidence-based Product Requirements Document (PRD) for a software product by analyzing its public project URL, using the Playwright MCP server as the primary tool for live browser-based exploration whenever it is available (especially for JavaScript-rendered SPAs). Use when the user runs /prd-generator <url> or asks for a PRD to be generated from a live site/app URL.
---

# PRD Generator

Generate a comprehensive, evidence-based Product Requirements Document (PRD) by systematically exploring a project's URL — prioritizing the actual **running application** over raw HTML — and documenting only what can be observed, documented, or reasonably inferred — never fabricated.

## Input

Usage:

```text
/prd-generator https://example.com
```

- If no project URL is provided in `args`, or the URL is not a valid, well-formed URL, **stop and ask the user** to provide a project URL. Do not proceed or generate a placeholder PRD.
- If the user has supplied credentials for the target application (explicitly, in this conversation), you may use them to explore authenticated functionality. Never guess, request from third parties, or brute-force credentials.
- If the URL is unreachable, note this as an Analysis Limitation and still produce as much of the PRD as possible from whatever partial access was obtained. If literally nothing is accessible, report that clearly instead of generating a PRD.

## Golden Rule

**Do not hallucinate requirements.** Every requirement, rule, role, module, or integration in the PRD must trace back to one of:

1. **Observed** — directly verified in the running application (rendered UI, real navigation, real interaction).
2. **Documented** — explicitly stated in official documentation, source repository, API/OpenAPI docs, or the official product website.
3. **Inferred** — a reasonable inference from observed/documented material, but not explicitly confirmed. Must be labeled as inferred.
4. **Unknown** — could not be determined. State this explicitly rather than guessing or omitting silently.

Never present `Documented`, `Inferred`, or `Unknown` information as live `Observed` behavior. Never invent APIs, integrations, roles, business rules, or acceptance criteria that contradict observed behavior. Never assume a feature exists just because it's common in similar products, and never use generic knowledge of similar products to fill a gap.

## Application Type Detection

After the first fetch of the project URL, decide whether you're looking at a fully server-rendered page or a JavaScript-rendered SPA shell before drawing any conclusions:

- Treat the initial HTML as an **empty/near-empty SPA shell** — not evidence of "no functionality" — when it consists mainly of a root mount node (e.g. `<div id="app"></div>`, `<div id="root"></div>`, `<div id="__next">`), `<script>` bundle tags, and little else, regardless of the `<title>`.
- Look for framework fingerprints: `data-reactroot`, `ng-version`, `__NUXT__`, `__NEXT_DATA__`, `v-cloak`/Vue attributes, webpack/vite chunk names, etc.
- If the shell is minimal and framework fingerprints suggest React/Vue/Angular/Next.js/Nuxt/other SPA tooling, classify the app as **JavaScript-rendered** and move to live browser-based exploration (Playwright MCP first) before drawing any functional conclusions from the raw HTML. For example, if `WebFetch` returns only `<div id="app"></div>`, that is **not** evidence the application has no functionality — it means the app must be rendered live: check for Playwright MCP, open the URL with it, wait for rendering, inspect the rendered DOM, and explore the application from there.
- If the initial HTML already contains substantial real content (server-rendered app, static site, docs site), proceed with fetch-based exploration as before, but still prefer Playwright MCP (or another browser tool) if available and deeper interaction (menus, forms, tables) would add evidence.

## Live Application Exploration (Playwright MCP First)

Live browser-based exploration is the primary exploration path whenever a suitable tool is available, and it is mandatory — not optional — whenever the target is JavaScript-rendered. **The Playwright MCP server is the first-choice tool for this** whenever it is available in the session.

### Mandatory Playwright MCP availability check

Before doing anything else exploration-related, and before ever reaching for `WebFetch`/`curl`/raw HTTP/source inspection as the *primary* mechanism, determine whether Playwright MCP tools are available in this session (check the active tool list / use ToolSearch, e.g. `select:browser_navigate` or a keyword search like "playwright" or "browser"). **Never assume Playwright MCP is unavailable without first actually checking.**

```text
Project URL
    ↓
Check available tools
    ↓
Is Playwright MCP available?
    ↓
YES
    ↓
Use Playwright MCP for live browser exploration
    ↓
Render JavaScript application
    ↓
Explore UI / navigation / workflows
    ↓
Collect observed evidence
    ↓
Use HTTP/source/documentation only as supplementary evidence
    ↓
Generate PRD
```

If Playwright MCP is not available (and no equivalent browser-automation tool is available either):

```text
Project URL
    ↓
HTTP/WebFetch/curl/source analysis
    ↓
Official documentation
    ↓
Generate PRD with appropriate limitations
```

If Playwright MCP tools are present, they **must** be used for live exploration — do not immediately default to `WebFetch`/`curl`/raw HTTP/source-code inspection as the primary exploration mechanism when Playwright MCP is available. Those methods remain useful, but only as **supplementary** evidence (route hints, documentation, API shapes) once Playwright MCP has been used for the actual live exploration. If Playwright MCP is unavailable but some other browser-automation tool is present (e.g., a different MCP browser tool), use that as the fallback live-exploration mechanism and note in the Analysis Methodology that Playwright MCP specifically was not the tool used.

### Using Playwright MCP for exploration

1. **Open the project** — navigate to the provided URL via Playwright MCP.
2. **Wait for rendering** — wait until the application has finished its initial rendering (network idle / DOM stable / key elements present) before inspecting anything. Do not rely only on the initial HTML response.
3. **Inspect the rendered page**, including: page title, URL, visible text, navigation, links, buttons, forms, input fields, labels, dropdowns, tables, search fields, filters, pagination, tabs, modals, notifications, error messages, and empty states.
4. **Interact with the application** where safe and appropriate: click navigation items, open menus, open dropdowns, fill forms, submit non-destructive forms, search, apply filters, change tabs, navigate between pages, open details, and return to previous pages. The goal is to discover actual product behavior, not merely inspect static source code.
5. **Record each finding immediately** with its evidence (route/URL, component, action taken) — do not defer this to the end.
6. **Do not conclude "no accessible functionality"** for a JS app solely because the first HTML payload was an empty shell — that is a signal to explore live via Playwright MCP, not a finding.
7. Do not report a feature as missing simply because it wasn't present in the initial raw HTML; only report it missing if it was genuinely absent after rendering and reasonable navigation with Playwright MCP.

### Systematic exploration strategy

Do not simply open the URL and inspect the first page. After the application loads, build an internal exploration map of what actually exists, e.g.:

```text
Application
├── Authentication
├── Dashboard
├── Module A
│   ├── List
│   ├── Create
│   ├── Edit
│   └── Details
├── Module B
└── Module C
```

The actual modules must be discovered from the application (live via Playwright MCP, or from documentation/source when Playwright MCP is unavailable) — never assumed from product/domain knowledge.

Use Playwright MCP to identify the application's navigation structure, then for each accessible navigation item:

1. Identify the navigation item.
2. Click/open it via Playwright MCP.
3. Wait for the page to render.
4. Record page name, URL/route, page heading, visible components, available actions, forms, tables, filters, search, buttons, and messages.
5. Explore relevant child pages.
6. Return to the navigation and continue (don't repeatedly re-explore the same page unless necessary).

### Exploration Inventory

While exploring (browser-based or fetch-based), maintain a running inventory — in your scratchpad, not the project — with one row per screen/page visited:

```text
Module | Page | URL/Route | Navigation Path | Visible Components | Available Actions |
Inputs | Outputs | Validation | Messages | Observed Behavior | User Role | Evidence | Source Type | Confidence
```

The module/page structure in the PRD must come from what this inventory actually shows was discovered in the application — never assumed from the product's name or category. Before generating the PRD, also maintain an internal coverage checklist across authentication, dashboard, main navigation, each accessible module, child pages, forms, CRUD functionality where safely accessible, search, filters, sorting, pagination, validation, error messages, success messages, user workflows, and role-specific behavior — marking each as `Observed`, `Documented`, `Inferred`, `Unknown`, or `Not Accessible`.

## Authentication Handling

If the application (or a route within it) shows a login/sign-in page:

- Do not stop exploration at the login page. First inventory everything reachable without logging in (public marketing pages, docs, public API references, any preview/demo areas).
- Check whether valid credentials are explicitly available (provided by the user in this conversation, or documented public demo credentials, e.g. from an official README/docs page). Do not guess, generate, or brute-force credentials, and do not use credentials from unrelated/unofficial sources.
- If valid credentials are available, use Playwright MCP (when available) to: navigate to the login page, identify the username field, identify the password field, fill in the provided credentials, submit the login, wait for authentication to complete, and continue live exploration of the authenticated areas reachable by that role. If multiple roles are documented but you only hold credentials for one, explore that one live and mark other roles' functionality as `Documented`/`Inferred`/`Unknown` as appropriate.
- If no credentials are available, do not fabricate authenticated functionality. Still use Playwright MCP to explore the public/login page and any publicly accessible functionality, and use official documentation/source as supplementary evidence for anything behind the login. Record verbatim in the Analysis Limitations and Analysis Methodology sections:

  ```text
  Authentication required. Authenticated functionality could not be live-verified.
  ```

  Then rely only on official documentation/source/API docs for anything behind that login, labeling it `Documented`, `Inferred`, or `Unknown` — never `Observed`.

## Source Priority

When multiple sources of information are available, prefer them in this order and record which one supported each finding:

1. Live application observation via **Playwright MCP** (or another browser-automation tool if Playwright MCP is unavailable) → classify as `Observed`.
2. Official project documentation → classify as `Documented`.
3. Official source repository → classify as `Documented`.
4. Official API/OpenAPI documentation → classify as `Documented`.
5. Official product website → classify as `Documented`.
6. HTTP/source inspection (`WebFetch`/`curl`/raw source) → classify as `Documented`.
7. Reasonable inference from the above → classify as `Inferred`.

Never classify source-code-only or HTTP-fetch-only findings as `Observed` unless the same behavior was also verified live through Playwright MCP (or the fallback browser tool). Never substitute generic/general knowledge about "similar products" for missing evidence at any priority level.

**Source-code evidence must not replace UI evidence.** For example, if a live JavaScript bundle references routes like `/dashboard`, `/pim`, `/leave`, `/time`, `/recruitment` and Playwright MCP can reach the application, treat those routes only as navigation hints: use Playwright MCP to actually navigate to them, wait for rendering, and record the real rendered behavior. Do not generate a requirement such as "the application provides employee management functionality" solely because a route name like `/pim` exists in a bundle — verify it through Playwright MCP whenever possible, and if it cannot be verified, label it `Documented`/`Inferred` accordingly rather than `Observed`.

## Safe Exploration Rules

Playwright MCP exploration must be primarily read-only:

- Do not delete real data, delete records or users, remove configurations, trigger real financial transactions, or change critical/shared/production configuration.
- If understanding a workflow requires interaction (e.g., submitting a form), use safe/test/benign values and prefer actions that are clearly reversible or sandboxed (e.g., a demo/staging instance, a "preview" action, cancelable flows).
- If a workflow requires a potentially destructive action to complete, stop before that step and document it as **unverified** rather than fabricating its outcome — describe only what was observed up to the point exploration stopped.

## Dynamic Content Handling

Use Playwright MCP to wait for SPA initialization, API-driven content, tables, dropdowns, AJAX requests, page transitions, and lazy-loaded components before concluding an element is absent. If an element is not immediately available: wait appropriately, re-inspect the page, check whether the application has finished rendering, and retry the safe interaction when appropriate. Do not classify a feature as unavailable just because it wasn't present on the first inspection pass.

## Playwright MCP Unavailable or Failing

Only treat browser exploration as unavailable if Playwright MCP is genuinely unavailable (confirmed by actually checking the tool list/ToolSearch — never assumed), no equivalent browser-automation tool is available either, or a concrete technical failure prevents exploration (the server cannot connect, the browser cannot launch, navigation fails, etc.). In any of these cases:

1. Do not silently fall back to presenting documentation/source content as live application behavior.
2. Clearly record the **actual, specific** limitation in both Analysis Methodology and Analysis Limitations — describe what genuinely happened, e.g.:

   ```text
   Major Limitation:
   Playwright MCP was not available in this session (no matching tool found). The target application
   is a JavaScript-rendered SPA; initial HTTP retrieval returned only the application shell. Live
   browser-based exploration could not be performed. The PRD relies primarily on official
   documentation and source material for functionality that would otherwise require live rendering.
   ```

   Never write a generic limitation like "browser automation was not available/configured this session" if Playwright MCP was in fact available — if it was available, it must have been used.
3. Continue the analysis using official documentation/source/API docs per the Source Priority order above.
4. Label everything sourced this way as `Documented`, `Inferred`, or `Unknown` — never `Observed`.
5. Lower the overall PRD confidence accordingly (see Confidence Calculation).

## Confidence Calculation

Confidence is derived from the actual evidence gathered, not assumed:

- **High** — substantial functionality directly `Observed` in the live application across multiple modules/roles.
- **Medium** — a mix of live `Observed` evidence and authoritative `Documented` evidence, with some gaps.
- **Low** — primarily `Documented`/`Inferred`, with limited or no live verification (e.g., browser exploration unavailable/failed, or blocked early by authentication).
- **Unknown** — insufficient evidence of any kind to assess the product meaningfully.

Never default the overall PRD confidence to High. If the application could not be rendered/explored live, the confidence must explicitly reflect that limitation (Medium at best if strong documentation exists, otherwise Low).

## Execution Flow

Work through these steps in order. Keep a running internal notes file (in your scratchpad, not the project) of evidence per finding, plus the Exploration Inventory — you will need to cite evidence throughout the PRD.

1. **Validate the URL.** Confirm it's well-formed (scheme + host). If missing/invalid, ask the user for one and stop.
2. **Check tool availability first.** Determine whether Playwright MCP tools are available in this session (check the active tool list / ToolSearch) before deciding on an exploration strategy. Never assume it is unavailable without checking.
3. **Initial URL analysis.** Fetch the URL (e.g., via WebFetch) to get the initial HTTP status, redirects, and raw HTML/headers — this is a quick supplementary check, not the primary exploration mechanism when Playwright MCP is available.
4. **Detect application type** using the Application Type Detection rules above (server-rendered vs. JS-rendered SPA shell).
5. **Use Playwright MCP for live browser-based exploration whenever it is available** — this is mandatory for JavaScript-rendered apps and preferred even for server-rendered ones when deeper interaction would add evidence. Open the URL with Playwright MCP and wait for the application to fully render before inspecting it.
6. **Explore the rendered/live application systematically via Playwright MCP** — build the exploration map, navigate through accessible modules/pages, expand menus, open dropdowns, inspect forms/buttons/tables/filters/search/pagination/modals, trigger safe interactions, and observe validation/notifications, updating the Exploration Inventory as you go. If the app also exposes ordinary linked pages (docs, help, pricing, `/api`, sitemap.xml, robots.txt), explore those too as supplementary evidence.
7. **Handle authentication** per the Authentication Handling rules if a login page is encountered — do not stop there.
8. **If Playwright MCP is unavailable or exploration fails**, follow the Playwright MCP Unavailable or Failing steps and fall back to official documentation/source/API docs as supplementary (not substitute) evidence, labeled accordingly.
9. **Identify major modules/features** strictly from what was actually discovered (live or documented) — never assumed from the product name or category.
10. **Identify users and roles** — from live role-gated UI, signup flows, pricing tiers, or docs mentioning roles/permissions.
11. **Identify workflows** — end-to-end sequences actually navigated or explicitly documented.
12. **Identify functional behavior** — forms, inputs, buttons, search, filters, sorting, pagination, tables, dashboards, modals.
13. **Identify validations and business rules** — required fields, error messages, constraints observed live or visible in docs.
14. **Identify data and integrations** — entities/fields displayed, any third-party services/APIs explicitly named, observed, or documented.
15. **Identify observable non-functional behavior** — responsiveness, apparent performance, HTTPS/security indicators, accessibility landmarks (only what's observable — do not assert compliance with standards like WCAG/OWASP/GDPR without evidence).
16. **Record evidence and uncertainty** for every finding as you go, tagging each as Observed/Documented/Inferred/Unknown with its source (URL/route, doc page, or reasoning).
17. **Build the requirements inventory** — consolidate findings into FR/US/BR/NFR candidates with IDs.
18. **Detect and merge duplicate/overlapping requirements.**
19. **Compute overall confidence** per the Confidence Calculation rules.
20. **Generate the complete PRD** following the structure below, including Analysis Methodology and Evidence Summary.
21. **Self-review the PRD for hallucinations** (see Anti-Hallucination Validation) — re-check every non-"Unknown" claim has a cited evidence source and correct classification; downgrade, reclassify, or remove anything unsupported.
22. **Validate ID consistency and traceability** — every FR/US/BR/module referenced in the traceability matrix must exist and use consistent IDs throughout.
23. **Save the final document** to `Output/PRD/Project_PRD.md`, creating the `Output/PRD` directory if needed. Do not modify any other files.

## Anti-Hallucination Validation

Before saving the PRD, review the full draft specifically for unsupported statements:

- For every requirement/rule/module/integration claim, confirm it has a matching evidence entry and the correct Observed/Documented/Inferred/Unknown classification.
- For any statement that lacks supporting evidence: remove it, downgrade it to `Inferred`, or mark it `Unknown` — never leave it presented as confirmed.
- Confirm nothing labeled `Documented`, `Inferred`, or `Unknown` has been reworded elsewhere in the document to sound like live `Observed` behavior.
- Confirm the computed overall confidence (Confidence Calculation) is consistent with the actual mix of Observed/Documented/Inferred/Unknown findings in the document.

## PRD Structure

Generate the Markdown document with exactly these sections, in order. Omit granular sub-content only when there is genuinely nothing to report for it (still keep the heading and write "Unknown — not observed").

1. **Document Information** — project name, project URL, document purpose, generated date, analysis scope, analysis limitations.
2. **Analysis Methodology** — explain: whether Playwright MCP was available in this session; whether live browser exploration was performed (and with what tool — Playwright MCP, a fallback browser tool, or none); which pages/routes were explored; whether the app was detected as JavaScript-rendered and why; whether authentication was required, whether credentials were available, and how login was handled; whether official documentation/source/API docs were used and for what; which parts of the PRD were directly `Observed`, which were `Documented`, which were `Inferred`; and what remains `Unknown`. If Playwright MCP was unavailable or failed, state that plainly here with the concrete reason (see Playwright MCP Unavailable or Failing).
3. **Product Overview** — what the product is, apparent purpose, problem solved, value proposition, target domain. Separate observed facts from assumptions.
4. **Product Goals** — split into Confirmed Goals and Inferred Goals.
5. **Target Users and Personas** — per user type: name, description, responsibilities, main goals, accessible functionality. Mark undeterminable personas as Unknown.
6. **User Roles and Permissions** — roles, permissions, accessible modules, role-specific behavior; role-permission matrix where evidence supports it.
7. **Product Modules** — per module: name, purpose, description, related screens, main functionality, related roles, evidence/source (cite the Exploration Inventory route where applicable).
8. **Functional Requirements** — table with columns `ID | Module | Requirement | User/Actor | Priority | Evidence | Confidence`, IDs `FR-001`, `FR-002`, ... Describe what the system does, not implementation.
9. **User Stories** — format `As a [user], I want to [action], so that [benefit]`, IDs `US-001`, ... Only for observed/documented functionality.
10. **User Flows** — per flow: name, actor, preconditions, main flow, alternative flows, error/exception flows, expected outcome. Use Mermaid `flowchart TD` diagrams where they clarify a real, observed flow. Never invent steps.
11. **Detailed Feature Requirements** — per major module: Feature Description, Preconditions, Main Behavior, Inputs, Validations, Business Rules, Outputs, Error Handling, Alternative Scenarios, Permissions, Dependencies, Acceptance Criteria (Given/When/Then, evidence-supported only).
12. **Business Rules** — IDs `BR-001`, ...; columns: Rule ID, Description, Related module, Trigger/condition, Expected behavior, Evidence, Confidence. Mark inferred rules clearly.
13. **Data Requirements** — per entity: name, description, fields, field type (if known), required/optional (if observable), validation rules, relationships (if known). Do not invent backend/DB structures.
14. **UI/UX Requirements** — navigation, layout, forms, buttons, dropdowns, tables, filters, search, pagination, messages, modals, responsive behavior, accessibility observations. Focus on behavior, not visual-design opinions.
15. **Integration Requirements** — only observable/documented integrations; per integration: name, purpose, direction, data exchanged (if known), trigger, expected behavior, evidence, unknowns.
16. **Non-Functional Requirements** — only explicitly stated or reasonably observable NFRs (performance, security, availability, reliability, scalability, usability, accessibility, compatibility, maintainability, observability). Label observed vs. inferred. Do not claim standards compliance (OWASP/WCAG/GDPR/specific perf targets) without evidence.
17. **Error Handling and Validation** — observed validation messages, required-field behavior, invalid input behavior, auth failures, authorization failures, empty states, system errors, network errors, recovery behavior.
18. **Notifications and Messages** — success/warning/error messages, confirmation dialogs, notifications, system feedback. Quote exact wording sparingly, only when useful.
19. **Assumptions and Constraints** — subsections: Confirmed Assumptions, Inferred Assumptions, Known Constraints, Unknown Information.
20. **Dependencies** — between modules, features, roles, external systems, data, workflows.
21. **Requirements Traceability** — table: `Requirement ID | Module | User Story | Feature | Evidence | Confidence`. IDs must match earlier sections exactly.
22. **Open Questions** — list of clarifications needed (unknown business rules, missing permission details, unclear validations, unknown integrations, unclear edge cases, missing NFRs).
23. **Analysis Limitations** — inaccessible pages, auth restrictions, features requiring unavailable accounts, broken functionality, dynamic content that couldn't be inspected, unverifiable information, Playwright MCP availability/failures.
24. **Evidence Summary** — counts of findings by classification, a Playwright-specific breakdown, and the overall confidence:

    ```text
    Observed findings (via Playwright MCP): <count>
    Documented findings: <count>
    Inferred findings: <count>
    Unknown findings: <count>

    Overall confidence: <High | Medium | Low | Unknown> — <one-line justification>
    ```

    Also include a Browser Exploration subsection:

    ```text
    ### Browser Exploration

    - Playwright MCP Available: Yes/No
    - Playwright MCP Used: Yes/No
    - Pages Explored: <count>
    - Authenticated Exploration: Yes/No/Partial
    - Major Browser Limitations: <describe, or "None">
    ```

25. **PRD Quality Summary** — counts of modules, functional requirements, user stories, business rules, user roles, workflows, integrations, unknown/open areas; short confidence assessment of the overall PRD (consistent with the Evidence Summary).

## Quality Rules (strict)

1. Never fabricate functionality, business rules, APIs/integrations, or user roles.
2. Never fabricate acceptance criteria that contradict observed behavior.
3. Always distinguish Observed / Documented / Inferred / Unknown, and never present Documented/Inferred/Unknown as live Observed behavior.
4. Preserve evidence references for every non-trivial requirement.
5. Use consistent IDs throughout (FR-, US-, BR-) — no reuse, no gaps that break traceability.
6. Avoid duplicate or overlapping requirements — merge them.
7. Never convert an assumption into a confirmed requirement.
8. Never assume a feature exists just because similar products typically have it, and never fill evidence gaps with generic knowledge of similar products.
9. Use `Unknown` explicitly whenever information cannot be determined.
10. Do not modify the project, its source, or any input files, and do not perform destructive/irreversible actions while exploring — only write the PRD output file.
11. Keep Markdown professional, readable, and well-tabled.
12. Use Mermaid diagrams only for workflows that were genuinely discovered.
13. Do not treat a minimal initial HTML/SPA shell as proof of missing functionality — attempt live exploration via Playwright MCP first.
14. Playwright MCP is the first-choice tool for live application exploration whenever it is available — never assume it is unavailable without checking, and never let `WebFetch`/`curl`/source inspection substitute for it as the primary exploration mechanism when it is available.
15. When Playwright MCP (and any fallback browser tool) is genuinely unavailable or fails, say so explicitly with the concrete reason and lower confidence accordingly, rather than quietly relying on documentation as if it were live behavior.
16. The final PRD must be usable by QA, engineering, product, and business stakeholders.

## Output

Write the completed PRD to `Output/PRD/Project_PRD.md` (create `Output/PRD` first if it doesn't exist). Do not create or modify any other files in the project.

## Final Response

After saving the PRD, reply with a concise summary (no unsupported claims):

- Project analyzed (name, if determinable)
- URL analyzed
- Whether Playwright MCP was available, and whether it was used for live exploration (and, if not used, the concrete reason)
- Pages/routes explored and whether authentication was completed
- Output file path
- Number of modules identified
- Number of functional requirements
- Number of user stories
- Number of business rules
- Number of open questions
- Overall confidence
- Any major analysis limitations
