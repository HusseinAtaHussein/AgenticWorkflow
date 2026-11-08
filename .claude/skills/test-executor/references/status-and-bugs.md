# Status assignment and bug/blocker/test-design-issue classification

## PASS / FAIL / BLOCKED decision guide

Ask in this order:

1. **Could the test even be attempted?** If not (auth failure, app down, missing permission, missing
   required test data, Playwright/browser failure, an unavailable prerequisite step) → `BLOCKED`. Record
   the specific reason. Don't guess around a blocker to force a different status.
2. **Was the target UI actually reached and the action actually performed?** If the element genuinely
   couldn't be located after ruling out "not loaded yet" / "wrong page" / "still rendering," first ask
   whether the test case itself might be outdated (see Test Design Issues below) before treating it as
   `BLOCKED` or `FAIL`.
3. **Does the observed result match the CSV's Expected Result?** Match → `PASS`. Genuine mismatch, with
   evidence → `FAIL`.

Never let "I wasn't able to fully verify this" quietly become `PASS`. Never let a flaky/one-off timing
issue immediately become `FAIL` without at least confirming the state settled — but never loop retrying a
functional action just to manufacture a passing result either. The middle ground when you truly can't
tell is `BLOCKED` with an honest description of what happened.

## Bug vs. Blocker vs. Test Design Issue

These three are easy to conflate under time pressure — keep them distinct:

**Bug** — the application itself did something that doesn't match its own documented/expected behavior,
confirmed by direct observation. Example: clicking Search with valid criteria leaves the loading spinner
visible indefinitely and no results ever render, on a repeat attempt too.

**Blocker** — something *external* to the application-under-test prevented the test from running or being
verified at all. Example: login itself fails, so nothing downstream can be checked; or a required
permission/role isn't available to this account, so the feature can't be reached to test it. A blocker
says "I couldn't check," not "I checked and it's wrong."

**Test Design Issue** — the test case itself no longer matches reality: it references a UI element that
no longer exists, an outdated page, an expected result that contradicts current documented behavior,
incomplete steps, or undefined required test data. This is a problem with the *test*, not the
*application* — don't write it up as a bug, and don't silently rewrite the test case to paper over it;
record the issue and let a human update the test design later.

Quick test: if fixing the *application* would resolve it, it's a Bug. If fixing the *environment/access/
prerequisites* would resolve it, it's a Blocker. If fixing the *test case* would resolve it, it's a Test
Design Issue.

## Before writing a bug report, rule out

- Invalid or missing test data specified in the CSV
- A missing prerequisite that was never actually satisfied
- An environment/permission/browser/Playwright problem
- An outdated test case (→ Test Design Issue instead)
- An authentication problem masquerading as a feature failure

Only write the bug once you've ruled these out and the defect is directly observable in the UI.

## Severity vs. Priority for bugs

- **Severity** — technical/functional impact if unfixed (Critical: core workflow completely broken or
  data-loss risk; Major: significant functionality broken with no reasonable workaround; Minor: a
  workaround exists or impact is limited; Trivial: cosmetic).
- **Priority** — how urgently it should be addressed, which can differ from severity (e.g. a Trivial
  cosmetic bug on the primary landing page a stakeholder demos daily might still get High priority).

Don't copy one field into the other by default — think about each independently, same as in
`test-designer`.
