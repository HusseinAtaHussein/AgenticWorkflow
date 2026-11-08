# Output/Framework

Self-contained Playwright automation project for the OrangeHRM MyInfo work. Everything
needed to install, write, and run the automation lives in this one folder.

## Layout

- `src/` — the test automation suite (page objects, fixtures, specs) used for real test
  runs via `npx playwright test`.
- `scripts/` — standalone exploration scripts (`explore-my-info.js`, `diagnose.js`) used to
  drive a real browser for UI-exploration evidence gathering when no Playwright MCP server
  is available. Not part of the `src/` test suite.
- `artifacts/` — output of the exploration scripts (`screenshots/`, `data/`).
- `playwright.config.ts`, `tsconfig.json`, `package.json` — project configuration.
- `test-data/` — fixtures/data used by the test suite.

## Setup

```bash
cd Output/Framework
npm install
```

## Running the test suite

```bash
npm test                # full suite
npm run test:myinfo     # My Info feature specs only
npm run test:ui         # Playwright UI mode
npm run report          # open the last HTML report
```

## Running the exploration scripts

Credentials are passed as environment variables and are never written to any file these
scripts produce (JSON, logs, screenshots).

```bash
LOGIN_USERNAME=<username> LOGIN_PASSWORD=<password> npm run explore:my-info
```

Artifacts are written to `artifacts/`:
- `artifacts/screenshots/` — full-page screenshots at each step
- `artifacts/data/my-info-findings.json` — structured evidence (fields, dropdown options,
  validation errors, table/empty-state observations) used to write the UI Exploration report
- `artifacts/data/run-log.txt` — narrative run log (no credentials)

The exploration script performs no destructive actions: it never completes a Save that
would persist a new or cleared record. Where it clicks Save inside an Add form, it does so
only to observe client-side validation errors, then cancels the form without submitting.
