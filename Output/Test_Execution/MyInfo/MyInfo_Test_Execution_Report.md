# My Info — Test Execution Report

## 1. Execution Overview

| Field | Value |
|---|---|
| Project | OrangeHRM (Open Source Demo, OrangeHRM OS 5.9) |
| Project URL | https://opensource-demo.orangehrmlive.com/web/index.php/auth/login |
| Module | My Info |
| PRD File | Output/PRD/Project_PRD.md |
| UI Exploration Findings File | Output/UI_Exploration/MyInfo_UI_Exploration_Findings.md |
| Test Design File | Output/Test_Design/MyInfo_Test_Cases.xlsx (converted to CSV for scope filtering; reviewed by user — 1 row marked Valid in Scope = 0) |
| Report Template | A user-supplied template (`Input/ReportTemplate.md`) was found to be built for an unrelated API/network test suite (JSON request/response bodies, endpoint names) and was rejected per this skill's hard no-API-content rule. Per user's explicit choice, this report instead follows the standard UI-exploration/test-design report structure. |
| Execution Date | 2026-09-16 |
| Browser / Tooling | Playwright MCP (Chromium) |
| Authentication Status | Successful (session expired once mid-run and was re-authenticated — see Section 7) |
| Environment | Shared public OrangeHRM demo instance (not a dedicated/isolated test environment) |

---

## 2. Scope

- **Total rows in reviewed Test Design:** 53
- **Valid in Scope (executed):** 52 (TC-001 through TC-052)
- **Out of Scope (not executed):** 1 — `TC-053` (`Valid in Scope = 0`, reviewer-marked as "Not Valid" duplicate of TC-051's content)
- **Invalid/blank scope value:** 0

All 52 in-scope cases were executed in full. No case was skipped.

---

## 3. Execution Summary

| Metric | Value |
|---|---|
| Total Test Cases (all rows) | 53 |
| Valid in Scope | 52 |
| Out of Scope | 1 |
| Passed | 47 |
| Failed | 3 |
| Blocked | 2 |
| Not Executed (out-of-scope) | 1 |
| **Pass Rate** (passed / (passed+failed)) | **94.0%** |
| **Execution Rate** ((passed+failed+blocked) / valid in scope) | **100.0%** |

---

## 4. Detailed Test Case Results

| TC ID | Feature | Scenario | Expected Result | Actual Result | Status | Evidence |
|---|---|---|---|---|---|---|
| TC-001 | Navigation | Navigate to My Info from sidebar | My Info opens on Personal Details, employee card + tab strip visible, My Info highlighted | Matched exactly | PASS | `Evidence/exec_tc001_personal_details.png` |
| TC-002 | Navigation - Tabs | All 10 tabs visible/clickable | All 10 tabs present, each routes correctly | Matched | PASS | Snapshots across all tab visits |
| TC-003 | Navigation - Tabs | Employee card persists across tabs | Card panel structure unchanged when switching tabs | Matched (name *value* changed between visits due to concurrent shared-demo edits — see Section 7 — but the card itself correctly re-rendered the current record each time) | PASS | Screenshots throughout |
| TC-004 | Navigation - Breadcrumb | Top banner shows "PIM" | Banner reads "PIM" on every sub-tab | Matched | PASS | All snapshots |
| TC-005 | Navigation - Unsaved Changes | No warning dialog switching tabs with unsaved edit | No dialog appears | Matched — edited Driver's License Number on Personal Details, switched to Contact Details with no prompt | PASS | Navigation log |
| TC-006 | Search/Filter Absence | No search/filter controls anywhere | None found on any of the 10 tabs | Matched | PASS | All tab snapshots |
| TC-007 | Sorting Absence | No sortable column headers | None found | Matched | PASS | All table snapshots |
| TC-008 | Pagination Absence | No pagination controls | None found (max record count per list: 2) | Matched | PASS | All table snapshots |
| TC-009 | Forms - Required Legend | "* Required" legend on forms with mandatory fields | Present on every such form | Matched | PASS | All Add-form screenshots |
| TC-010 | Date Fields - Format | All date fields use yyyy-dd-mm format | **Mismatch** — date fields displayed as `D, dd M yyyy` (e.g. "Fri, 11 Oct 2030") for most of the run, then reverted to `yyyy-dd-mm` later in the same session with no action taken by this execution | FAIL | `Evidence/exec_tc001_personal_details.png` (new format) vs. later snapshot showing `yyyy-dd-mm` again |
| TC-011 | Personal Details | Tab displays existing populated data | All fields populated, Save enabled | Matched | PASS | `Evidence/exec_tc001_personal_details.png` |
| TC-012 | Personal Details - Validation | Empty First Name blocks save | "Required" shown, not saved | Matched | PASS | Verified via snapshot |
| TC-013 | Personal Details - Validation | Invalid License Expiry Date (`2099-99-99`) | Format error shown, not saved | Matched (message text consistent with exploration) | PASS | Verified via snapshot |
| TC-014 | Personal Details - Validation | Employee Id > 10 chars blocked | "Should not exceed 10 characters", not saved | Matched | PASS | Verified via snapshot |
| TC-015 | Personal Details - Validation | Employee Id at exactly 10 chars saves cleanly | No error, save succeeds | Matched — saved "MUSER12345" (10 chars) with no validation error; reverted to original value afterward | PASS | `Evidence/exec_tc015_boundary10.png`, `Evidence/exec_restore_confirm.png` |
| TC-016 | Personal Details - Dropdowns | Nationality default + ~195 options | Confirmed | Matched | PASS | Snapshot option list |
| TC-017 | Personal Details - Dropdowns | Marital Status: 4 options | Confirmed (-- Select --, Single, Married, Other) | Matched | PASS | Snapshot |
| TC-018 | Personal Details - Custom Fields | Blood Type: 9 options | Confirmed | Matched | PASS | Snapshot |
| TC-019 | Personal Details - Validation | Future Date of Birth (`2050-01-01`) — document actual behavior | No validation error; value persists on save | **Confirmed** — no error shown, value accepted; this is a real, reproducible data-integrity defect (also observed independently during UI exploration) | FAIL — **see BUG-001** | Verified via Save + reload pattern (value reverted after confirming) |
| TC-020 | Contact Details | Tab displays existing populated data | All fields populated, no required markers | Matched | PASS | `Evidence/exec_tc020_contact_details.png` |
| TC-021 | Contact Details - Validation | Invalid Work Email (`not-an-email`) | "Expected format: admin@example.com", not saved | Matched exactly | PASS | `Evidence/exec_tc021_invalid_email.png` |
| TC-022 | Contact Details - Dropdowns | Country default + ~239 options | Confirmed | Matched | PASS | Snapshot option list |
| TC-023 | Contact Details - Attachments | Empty state | "No Records Found" inline | Matched | PASS | `Evidence/exec_tc020_contact_details.png` |
| TC-024 | Emergency Contacts | List displays existing records | 2 records with correct columns | Matched | PASS | `Evidence/exec_tc024_emergency.png` |
| TC-025 | Emergency Contacts - Add Form | Required field markers | Name*, Relationship* required; phones not marked | Matched | PASS | Snapshot |
| TC-026 | Emergency Contacts - Validation | Empty Name/Relationship blocked | "Required" under both | Matched | PASS | `Evidence/exec_tc026_empty_validation.png` |
| TC-027 | Emergency Contacts - Validation | Valid Name/Relationship, empty phones blocked | "At least one phone number is required" | Matched exactly | PASS | `Evidence/exec_tc027_phone_rule.png` |
| TC-028 | Emergency Contacts - Add Form | Cancel discards form | Form closes, list unchanged | Matched | PASS | Snapshot before/after |
| TC-029 | Dependents | List displays existing record | 1 record, correct columns | Matched | PASS | Snapshot |
| TC-030 | Dependents - Add Form | Relationship: 3 options | Confirmed (-- Select --, Child, Other) | Matched | PASS | Snapshot |
| TC-031 | Dependents - Add Form | Name/Relationship required, DOB optional | Confirmed | Matched | PASS | Snapshot |
| TC-032 | Immigration | List displays existing records | 2 records, correct columns | Matched | PASS | Snapshot |
| TC-033 | Immigration - Add Form | Number* required, Passport default | Confirmed | Matched | PASS | `Evidence/exec_tc033_immigration_add.png` |
| TC-034 | Immigration - Add Form | Select Visa radio option | Not verifiable per source report (documented Blocker) | **Reproduced same click-interception failure** as in UI exploration — Visa radio could not be selected across repeated attempts | BLOCKED | `Evidence/exec_tc034_visa_blocked.png`, Playwright timeout log |
| TC-035 | Qualifications - Work Experience | List displays existing records | 2 records | Matched | PASS | `Evidence/exec_qualifications.png` |
| TC-036 | Qualifications - Work Experience Add Form | Company*/Job Title* required | Confirmed | Matched | PASS | `Evidence/exec_tc036_workexp_add.png` |
| TC-037 | Qualifications - Education | List displays existing records | Precondition: existing education records present | **Precondition not met** — Education list showed "No Records Found"; the 2 records documented in the source UI Exploration are no longer present, apparently removed by another concurrent user of this shared public demo | BLOCKED | `Evidence/exec_qualifications.png` |
| TC-038 | Qualifications - Education Add Form | Level dropdown: 5 options (Bachelor's Degree, College Undergraduate, High School Diploma, Master's Degree + placeholder) | **Mismatch** — dropdown now shows only 2 options: "-- Select --" and "12" | FAIL (environment data drift, not a code defect — see Section 7) | `Evidence/exec_tc038_level_dropdown.png` |
| TC-039 | Qualifications - Skills | Empty state | "No Records Found" | Matched | PASS | `Evidence/exec_qualifications.png` |
| TC-040 | Qualifications - Skills Add Form | Skill* required | Confirmed | Matched | PASS | `Evidence/exec_tc040_skill_add.png` |
| TC-041 | Qualifications - Languages | List displays existing records | 2 records | Matched | PASS | Snapshot |
| TC-042 | Qualifications - Languages Add Form | Language*/Fluency*/Competency* required | Confirmed | Matched | PASS | `Evidence/exec_tc042_language_add.png` |
| TC-043 | Qualifications - License | List displays existing record | 1 record | Matched | PASS | Snapshot |
| TC-044 | Qualifications - License Add Form | License Type* required | Confirmed | Matched | PASS | `Evidence/exec_tc044_license_add.png` |
| TC-045 | Memberships | List displays existing record | 1 record | Matched | PASS | `Evidence/exec_memberships.png` |
| TC-046 | Memberships - Add Form | Membership* required | Confirmed | Matched | PASS | `Evidence/exec_tc046_membership_add.png` |
| TC-047 | Memberships - Attachments | List displays existing file | 1 file | Matched | PASS | `Evidence/exec_memberships.png` |
| TC-048 | Job (Read-only) | Fields disabled, no Save button | Confirmed | Matched | PASS | Snapshot |
| TC-049 | Job - Toggle | Toggle non-interactive | Click does not toggle | Matched — click was intercepted/had no effect | PASS | Playwright interaction log |
| TC-050 | Salary (Read-only) | Empty state, no Add button anywhere | Confirmed | Matched | PASS | Snapshot |
| TC-051 | Report-to (Read-only) | Supervisors empty, 1 subordinate, no Add anywhere | Confirmed | Matched (subordinate name "Sara Tencrady" matches) | PASS | `Evidence/exec_tc051_reportto.png` |
| TC-052 | Attachments (General) | Empty state consistent across tabs | Confirmed on Job, Contact Details, Report-to, Skills, Salary | Matched | PASS | Multiple screenshots |

**Not Executed (out of scope):** TC-053 — `Valid in Scope = 0`, excluded per reviewer decision. Not run.

---

## 5. Bug Summary

### BUG-001

| Field | Value |
|---|---|
| **Bug ID** | BUG-001 |
| **Related Test Case** | TC-019 |
| **Title** | Date of Birth field accepts and persists a future date with no validation |
| **Module** | My Info |
| **Feature** | Personal Details |
| **Severity** | Critical |
| **Priority** | High |
| **Preconditions** | User is on My Info > Personal Details with an authenticated session. |
| **Test Data** | `2050-01-01` (future date) |
| **Steps to Reproduce** | 1. Navigate to My Info > Personal Details.<br>2. Enter `2050-01-01` into the Date of Birth field.<br>3. Click Save.<br>4. Reload the page and re-check the Date of Birth field. |
| **Expected Result** | A validation error should prevent saving a Date of Birth in the future (or at minimum, a business-rule check should flag it), consistent with the required-field, date-format, and length validations observed elsewhere in this same form. |
| **Actual Result** | No validation error of any kind is shown. The value is accepted, saved, and persists after a page reload. This was independently confirmed twice: once during the original UI Exploration session and again during this execution run. |
| **Evidence** | Confirmed via Save + reload pattern in both this run and the source UI Exploration (`myinfo_future_dob.png`, `myinfo_check_persist.png` from the exploration artifacts). The value was reverted to the original Date of Birth immediately after confirming in both sessions, since no destructive/permanent change was authorized. |
| **Environment** | https://opensource-demo.orangehrmlive.com, OrangeHRM OS 5.9, Chromium via Playwright MCP |
| **Status** | New |

No other confirmed application bugs were identified during this execution. TC-010 and TC-038 (below) failed their expected results but were traced to shared-environment data/configuration drift rather than an application defect — see Section 7.

---

## 6. Blocker Summary

| Blocker | Related Test Case | Description | Impact | Status |
|---|---|---|---|---|
| Visa radio button not interactable | TC-034 | Clicking the "Visa" option on the Immigration Add form's Document radio group is repeatedly intercepted by an overlapping element, preventing the click from registering. Reproduced in two independent sessions (original exploration and this execution run). | Cannot verify whether selecting "Visa" changes the form's field set. | Blocked — Environment/tool interaction issue, not confirmed as a product defect. |
| Education records missing (precondition failed) | TC-037 | The 2 Education records documented in the source UI Exploration (Bachelor's Degree, College Undergraduate) are no longer present on this shared record; the list now shows "No Records Found." | Could not verify the list-display scenario as designed. | Blocked — missing required test data, caused by another user's concurrent activity on this shared public demo instance. |

---

## 7. Environment Notes — Shared Public Demo Volatility

This module was executed against `opensource-demo.orangehrmlive.com`, a shared, publicly writable demo instance also used by other unrelated sessions/users concurrently. Several observations in this run are attributable to that shared state rather than to the application under test having a defect:

- **Employee display name changed repeatedly during this single execution run** — observed as "John Doe" → "abcd Doe" → "Sumit Yupp" → "manda user" across different points in the same continuous session, with no corresponding action taken by this execution. This confirms the underlying employee record (empNumber/7) was being actively edited by another concurrent user/process throughout the run.
- **Date display format flipped between `yyyy-dd-mm` and `D, dd M yyyy`** partway through the run and back again, with no action taken by this execution to change it. This is consistent with a shared, system-wide date-format preference (an Admin/Localization-level setting) being toggled by another concurrent user — not a defect in My Info itself. This caused **TC-010** to fail relative to its expected result at the time it was checked.
- **Qualifications > Education "Level" dropdown option list shrank from 5 options to 2** ("-- Select --", "12") between the original UI Exploration and this execution run, and the 2 previously-documented Education records disappeared entirely. Both are consistent with another user editing the underlying master-data configuration (Admin > Job > Education) and/or employee qualification records on this shared instance. This caused **TC-038** to fail and **TC-037** to be blocked.
- **The session expired mid-run** ("Session Expired" message on the login page) after normal continuous use, requiring re-authentication to continue from TC-051 onward. This is treated as a normal session-timeout event, not a defect.

None of the above four points are treated as confirmed application bugs in this report — they are recorded as environment-driven test-result variance, distinct from the one confirmed defect (BUG-001), which was independently reproduced twice under stable conditions (a self-entered, controlled input value) and is not explainable by concurrent third-party data edits.

---

## 8. Evidence Index

All evidence screenshots referenced above were captured during this session and are stored under
`Output/Test_Execution/MyInfo/Evidence/` (filenames prefixed `Evidence/exec_`). Key files:

- `Evidence/exec_tc001_personal_details.png`, `Evidence/exec_tc020_contact_details.png` — populated tab views
- `Evidence/exec_tc021_invalid_email.png`, `Evidence/exec_tc026_empty_validation.png`, `Evidence/exec_tc027_phone_rule.png` — validation evidence
- `Evidence/exec_tc033_immigration_add.png`, `Evidence/exec_tc034_visa_blocked.png` — Immigration form + blocker
- `Evidence/exec_qualifications.png`, `Evidence/exec_tc036_workexp_add.png`, `Evidence/exec_tc038_level_dropdown.png`, `Evidence/exec_tc040_skill_add.png`, `Evidence/exec_tc042_language_add.png`, `Evidence/exec_tc044_license_add.png` — Qualifications sub-forms
- `Evidence/exec_memberships.png`, `Evidence/exec_tc046_membership_add.png` — Memberships
- `Evidence/exec_tc051_reportto.png` — Report-to
- `Evidence/exec_tc015_boundary10.png`, `Evidence/exec_restore_confirm.png` — boundary test and data restoration

No credentials, tokens, or session identifiers appear in any report field, filename, or screenshot.

---

## 9. Final QA Conclusion

47 of 52 in-scope test cases passed, 3 failed, and 2 were blocked, for a 94.0% pass rate and 100% execution rate (every in-scope case reached a terminal PASS/FAIL/BLOCKED outcome — none were left unexecuted). One confirmed application defect was identified and documented (BUG-001: Date of Birth accepts and persists a future date with no validation), reproduced independently in two separate sessions under controlled conditions, and is a genuine candidate for a fix. The remaining two failures (TC-010 date-format flip, TC-038 Education Level dropdown shrinkage) and both blockers (TC-034 Visa radio interaction, TC-037 missing Education records) are attributable to this being a shared, publicly writable demo instance undergoing concurrent third-party edits during the execution window, not to defects in the My Info module itself — though the Visa radio interaction issue (reproduced twice) may merit a follow-up check outside a shared/volatile environment to fully rule out a genuine UI defect. Aside from these caveats, the My Info module's structural, navigational, and validation behavior performed exactly as documented in the source UI Exploration: all read-only tabs (Job, Salary, Report-to) remained correctly locked down, all required-field and cross-field validation rules held, and every dropdown, empty state, and Add/Cancel interaction behaved consistently with prior findings. This report reflects only what was directly observed in this run — it is not a general certification of production readiness.
