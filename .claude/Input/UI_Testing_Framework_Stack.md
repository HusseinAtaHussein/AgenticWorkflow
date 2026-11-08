# UI Testing Framework — Recommended Stack

A framework, not just a test collection: reusable page/component objects, fixtures, data
management, reporting, and CI wired together so new tests are cheap to add and failures are
cheap to diagnose.

---

## 1. Core Choices

| Decision | Recommendation | Why |
|---|---|---|
| Test runner + browser automation | **Playwright Test** | Auto-waiting, built-in retries/tracing, one API for Chromium/Firefox/WebKit, native parallelism, first-class TypeScript support. Materially less flaky than Selenium-based stacks out of the box. |
| Language | **TypeScript** | Catches locator/fixture typos and page-object contract breaks at compile time, not at 2am in CI. Autocomplete on page objects pays for itself fast. |
| Package manager | **npm** (or pnpm if you want faster installs/strict deps) | Either is fine; pick one and standardize — don't mix. |

**Alternative worth naming:** Cypress is a reasonable alternative if your team is JS-only and
wants a heavier built-in UI test runner/inspector — but it doesn't support WebKit, has weaker
multi-tab/multi-origin support, and true parallelism requires their paid dashboard or a lot of
manual sharding. For a framework meant to scale across many modules, Playwright is the stronger
default.

---

## 2. Framework Architecture (the part that makes it a "framework," not a script pile)

### Page Object Model + Component Objects
- One **page object per screen/route**, one **component object per reusable UI pattern**
  (data table, modal, dropdown-with-search, date picker). Your exploration reports are the
  actual source for what components repeat — e.g. a table pattern reused across many tabs
  should be one `DataTable` component object, not re-implemented per page.
- Page objects expose **actions and getters only** — no `expect()` calls inside them. Keeps
  them reusable across positive and negative test scenarios.
- Extend a shared `BasePage` for common concerns: navigation, waiting for the app shell,
  shared header/sidebar interactions.

### Fixtures over setup boilerplate
- Use Playwright's `test.extend()` to build custom fixtures: `authenticatedPage`,
  `apiClient`, `seededUser`. Fixtures compose, are typed, and auto-teardown — far less
  fragile than `beforeEach` chains copy-pasted across spec files.

### Layered locator strategy (in priority order)
1. `getByRole` / `getByLabel` / `getByText` — accessible, resilient to markup changes
2. `data-testid` — only when no accessible attribute exists; ask the dev team to add these
   rather than reaching for brittle CSS
3. CSS/XPath — last resort, always commented with why

---

## 3. Test Data Strategy

| Concern | Tool | Notes |
|---|---|---|
| Fake data generation | **@faker-js/faker** | Avoids collisions when running against shared/demo environments; generate unique emails, names, IDs per run. |
| Static reference data | Versioned JSON in `test-data/` | Dropdown option lists, environment-specific config — validated periodically against live UI, not assumed permanent. |
| Seeding via API, not UI | **Playwright's `request` fixture** | Create prerequisite records through API calls before a UI test runs, so UI tests stay focused on the behavior under test instead of re-doing setup clicks every time. |
| State isolation | Fresh browser context per test | Default Playwright behavior — don't share `page` across tests; avoids order-dependent flakiness. |

---

## 4. Assertions & Reporting

- **Assertions:** Playwright's built-in `expect` — web-first, auto-retrying, no need for a
  separate assertion library (Chai, etc.).
- **Local debugging:** built-in HTML reporter + `--ui` mode + trace viewer (`trace: 'on-first-retry'`)
  — traces give you a full DOM/network/console timeline per failed test, which is the single
  highest-leverage debugging tool in this stack.
- **CI reporting:** JUnit XML (for dashboards like Jenkins/GitLab) or Allure (richer history/trends)
  published as a build artifact.
- **Failure artifacts:** screenshot on failure, video on retry-only (cheap disk, high diagnostic value).

---

## 5. Visual & Accessibility Testing (optional but cheap to add)

| Concern | Tool | Notes |
|---|---|---|
| Visual regression | Playwright's `toHaveScreenshot()` | Built-in, no extra service needed for basic coverage; version baseline images per-OS since rendering differs. |
| Accessibility | **@axe-core/playwright** | Run `axe` scans as part of key-page tests; catches missing labels/contrast issues cheaply, complements manual exploration findings. |

---

## 6. Code Quality & Repo Hygiene

| Concern | Tool |
|---|---|
| Linting | ESLint + `@typescript-eslint` |
| Formatting | Prettier |
| Pre-commit enforcement | Husky + lint-staged |
| Type checking in CI | `tsc --noEmit` as a separate CI step |

---

## 7. CI/CD

- **Runner:** GitHub Actions (or GitLab CI/Jenkins — pick whatever the rest of the org uses,
  don't introduce a second CI system just for tests).
- **PR pipeline:** lint → typecheck → `@smoke`-tagged subset → publish HTML report as artifact.
- **Scheduled pipeline:** full regression + cross-browser matrix, nightly.
- **Sharding:** Playwright's built-in `--shard` support across CI runners once suite size
  makes single-runner execution slow.
- **Flake handling:** `retries: 2` in CI only, `retries: 0` locally, so failures surface
  immediately in local dev instead of being silently retried away.

---

## 8. Environment & Secrets Management

- `dotenv` with per-environment files (`.env.staging`, `.env.ci`) — never `.env.production`
  used for any test that writes data.
- Credentials and base URLs injected via env vars / CI secret store — never hardcoded in
  specs or page objects, never logged in reports (traces can leak form values — scrub
  sensitive fields before enabling tracing on forms that touch passwords/PII).
- Tag data-mutating tests (`@destructive`) so CI config can restrict them to disposable/sandbox
  environments only.

---

## 9. Suggested Folder Structure

```
.
├── src/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── login.page.ts
│   │   │   └── login.spec.ts
│   │   ├── my-info/
│   │   │   ├── my-info.page.ts
│   │   │   ├── personal-details.page.ts
│   │   │   ├── my-info.spec.ts
│   │   │   └── emergency-contacts.spec.ts
│   │   └── ...
│   ├── api/
│   │   ├── clients/
│   │   └── *.api.spec.ts
│   ├── e2e/
│   │   └── *.spec.ts              # cross-feature journeys only
│   ├── shared/
│   │   ├── base.page.ts
│   │   └── components/            # DataTable, Modal, DatePicker, etc.
│   ├── fixtures/
│   │   ├── auth.fixture.ts
│   │   ├── test-data.fixture.ts
│   │   └── index.ts
│   └── utils/
│       ├── api-client.ts
│       ├── data-generators.ts
│       └── env.ts
├── test-data/
├── playwright.config.ts
├── .env.example
├── tsconfig.json
├── .eslintrc.js
├── .prettierrc
└── package.json
```

---

## 10. Minimal `playwright.config.ts` shape

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [['junit', { outputFile: 'results.xml' }], ['html', { open: 'never' }]]
    : [['html']],
  use: {
    baseURL: process.env.BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

---

## 11. package.json scripts

```json
{
  "scripts": {
    "test": "playwright test",
    "test:smoke": "playwright test --grep @smoke",
    "test:regression": "playwright test --grep @regression",
    "test:api": "playwright test src/api",
    "test:ui": "playwright test --ui",
    "test:debug": "playwright test --debug",
    "report": "playwright show-report",
    "lint": "eslint . --ext .ts",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write ."
  }
}
```

---

## What Makes This a "Framework" vs. a Test Collection
1. **Composable fixtures**, not copy-pasted setup — new tests inherit auth/data/API access for free.
2. **Component objects** for repeated UI patterns, so a locator change is fixed in one place.
3. **Traceability** — tests map back to test-design artifacts (PRD, exploration reports, test-case IDs), so coverage gaps are visible, not assumed.
4. **Tagged execution tiers** (`@smoke`, `@regression`, `@destructive`) — the suite scales without every run taking longer.
5. **Consistent failure diagnostics** (trace, screenshot, video) — debugging a failure doesn't require re-running it locally first.
