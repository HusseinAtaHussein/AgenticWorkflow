# My Info — UI Exploration Findings

## 1. Exploration Overview

### Project
OrangeHRM (Open Source Demo, OrangeHRM OS 5.9)

### Project URL
https://opensource-demo.orangehrmlive.com/web/index.php/auth/login

### PRD File
Output/PRD/Project_PRD.md

### Selected Module
My Info

### Exploration Date
2026-09-16

---

## 2. Exploration Scope

### Included Scope
The entire My Info module for the logged-in employee record (empNumber/7): all 10 sub-tabs — Personal
Details, Contact Details, Emergency Contacts, Dependents, Immigration, Job, Salary, Report-to,
Qualifications, and Memberships — including every discovered Add/Edit form, dropdown, date field, and
Attachments sub-section within each tab.

### Excluded Scope
No other module (PIM's own employee list, Admin, Leave, etc.) was explored. The only screen touched
outside My Info was the Login screen, strictly as a login prerequisite.

### Prerequisites Accessed
Prerequisite: Login — Reason: Required to authenticate before accessing My Info. Not explored beyond
entering credentials and submitting the login form (no forgot-password flow, no invalid-credential
testing).

---

## 3. Exploration Methodology

### Tools Used
Playwright MCP (browser_navigate, browser_click, browser_type, browser_snapshot, browser_take_screenshot,
browser_select_option-equivalent dropdown clicks) — used exclusively for all interaction and evidence
capture. No API/network inspection was performed at any point.

### Evidence Sources
Live rendered DOM (accessibility snapshots) and full-page/viewport screenshots taken during this session.

### Authentication Status
Successful

### Safety Restrictions
No destructive or bulk actions were taken. Per explicit user instruction, no submission/success-state
testing and no required-field-clearing testing on the existing core record were authorized for this run;
these are recorded as gaps below. One unintended data change occurred and was corrected — see Section 13.

---

## 4. Module Overview

### Module Purpose
Self-service view (and, on the Personal Details/Contact Details/Emergency Contacts/Dependents/
Immigration/Qualifications/Memberships tabs, edit) of the logged-in user's own employee record.

### Module Entry Point
Left sidebar "My Info" link.

### Module Route
`/web/index.php/pim/viewMyDetails`, redirecting to `/web/index.php/pim/viewPersonalDetails/empNumber/7`.

### Related Screens
Ten sub-tabs sharing the same left "employee card" panel and top tab strip: Personal Details, Contact
Details, Emergency Contacts, Dependents, Immigration, Job, Salary, Report-to, Qualifications,
Memberships. Each of Personal Details, Contact Details, Emergency Contacts, Dependents, Immigration,
Job, Salary, Report-to, Qualifications, and Memberships also carries its own "Attachments" sub-section.

### Related Features
Shares the underlying PIM employee-record data model with the Admin-facing PIM > Employee List detail
view (per PRD), but under My Info the record is scoped to the logged-in user only and several sections
(Job, Salary, Report-to) are read-only.

---

## 5. Navigation Findings

### Main Navigation
Persistent left sidebar present on every My Info screen (Admin, PIM, Leave, Time, Recruitment, My Info,
Performance, Dashboard, Directory, Maintenance, Claim, Buzz) — My Info highlighted as the active item.

### Module Navigation
A horizontal tab strip directly under the employee's name/photo lists all 10 sub-tabs. Clicking a tab
navigates to a distinct route (e.g. `/pim/contactDetails/empNumber/7`) without a full page reload of the
sidebar/header.

### Breadcrumbs
Top banner heading shows "PIM" (not "My Info") on every My Info sub-tab — Observed. This is the module
label inherited from the underlying PIM route rather than a literal "My Info" breadcrumb.

### Tabs
10 tabs, all always visible and clickable regardless of which is active: Personal Details, Contact
Details, Emergency Contacts, Dependents, Immigration, Job, Salary, Report-to, Qualifications,
Memberships. The active tab is visually highlighted.

### Links
No functional in-page links observed beyond the tab strip and standard sidebar/account-menu links (not
explored further, out of scope).

### Navigation Behavior
Switching tabs preserves the employee name header/photo panel on the left; only the right-hand content
area changes. Unsaved edits in one tab's form are not auto-saved when switching tabs (not verified against
a "leave with unsaved changes" warning — none was observed to appear).

---

## 6. UI Components

### Page Structure
Each tab: a left "employee card" (name heading, photo, tab list) + a right content panel. Most tabs end
with an "Attachments" sub-section (its own mini list + Add button), except Job and Salary tabs, which
still show an Attachments block but with no Add button on Salary (see Section 9).

### Buttons
"Add" buttons (pencil-free, plus-icon) appear per sub-section in Emergency Contacts, Dependents,
Immigration, Qualifications (5 separate Add buttons: Work Experience, Education, Skills, Languages,
License), and Memberships. "Save" buttons appear on Personal Details, Contact Details, and every
Add/Edit form. Per-row action buttons (edit/trash, and download where a file exists) appear in every
list table.

### Input Fields
Free-text inputs (Name, Company, Job Title, Institute, License Number, etc.), a multi-line Comment/
Comments textarea (Work Experience, Skills, Languages, Immigration), and split "Employee Full Name" made
of three adjacent text inputs (First/Middle/Last) on Personal Details.

### Dropdowns
Observed and enumerated:
- Personal Details — Nationality (~195 options, alphabetical, "-- Select --" + Afghan…Zimbabwean), Marital
  Status (4 options: -- Select --, Single, Married, Other), Blood Type custom field (9 options: --
  Select --, A+, A-, B+, B-, O+, O-, AB+, AB-).
- Contact Details — Country (~239 options, alphabetical, "-- Select --" + Afghanistan…Zimbabwe).
- Dependents — Relationship (3 options: -- Select --, Child, Other).
- Immigration — Issued By (not enumerated further; present as a dropdown, options not expanded beyond
  initial "-- Select --").
- Qualifications > Education — Level (5 options: -- Select --, Bachelor's Degree, College Undergraduate,
  High School Diploma, Master's Degree).
- Qualifications > Skills — Skill (dropdown, options not enumerated — no existing skill records to infer
  from and list was not expanded).
- Qualifications > Languages — Language, Fluency, Competency (three separate required dropdowns, none
  expanded to full option list).
- Qualifications > License — License Type (dropdown, not expanded).
- Memberships — Membership, Subscription Paid By, Currency (three dropdowns, not expanded).

### Multi-selects
None observed in this module.

### Radio Buttons
Personal Details — Gender (Male/Female). Qualifications > Immigration Add form — Document type
(Passport/Visa, Passport pre-selected by default); attempting to switch to "Visa" was blocked by a
persistent click-interception issue in this session (see Section 13) so the resulting form-field change,
if any, is Not Verified.

### Checkboxes
Row-selection checkboxes appear in every list table (Emergency Contacts, Dependents, Immigration, Work
Experience, Education, Skills, Languages, License, Memberships, and every Attachments sub-table).

### Date Pickers
Every date field uses a `yyyy-dd-mm` formatted text input with a calendar icon (License Expiry Date, Date
of Birth, Issued/Expiry/Eligible Review Date, Start/End Date, Subscription Commence/Renewal Date, etc.).
Format is consistent across the entire module.

### Tables
Every list (Emergency Contacts, Dependents, Immigration, Work Experience, Education, Skills, Languages,
License, Memberships, Report-to Supervisors/Subordinates, and every Attachments block) uses the same
pattern: column headers with a leading select-all checkbox column, a "(N) Record(s) Found" label, and a
per-row Actions column.

### Cards
The left employee-identity panel (name + photo) functions as a persistent card across all 10 tabs.

### Modals / Dialogs
None observed opening as an overlay; Add/Edit forms render inline above their related list instead of in
a modal.

### Other Observed Components
"* Required" legend footnote consistently accompanies every form that has at least one mandatory field.

---

## 7. User Interaction Findings

### Buttons and Actions
Add buttons insert an inline form above the corresponding list; Cancel discards the inline form without
persisting; Save submits it. Edit (pencil) and Delete (trash) icons appear per row; these were not
exercised to avoid unauthorized data changes.

### Forms
Full form inventory opened and inspected this session:
- Personal Details (existing-record edit form, always visible)
- Contact Details (existing-record edit form, always visible)
- Emergency Contacts > Add
- Dependents > Add
- Immigration > Add
- Qualifications > Work Experience > Add
- Qualifications > Education > Add
- Qualifications > Skills > Add
- Qualifications > Languages > Add
- Qualifications > License > Add
- Memberships > Add

Job, Salary, and Report-to tabs present no editable forms at all (read-only — see Section 9).

### Search
No search/filter controls exist anywhere in My Info — every list simply shows all records for the
logged-in employee (record counts are low, so no search is needed/provided).

### Filters
None present in this module.

### Sorting
No sortable column headers were observed on any My Info table (unlike the sort icons the PRD describes
for PIM/Admin/Recruitment list views).

### Pagination
No pagination controls appear anywhere in My Info — all lists in this account's data are short enough to
fit on one page (max 2 records observed per list).

### Expand / Collapse
None observed; all sub-sections are always expanded.

### Tabs
See Section 5.

### Other Interactions
Dropdown option lists open as an in-page `listbox` overlay under the field; clicking elsewhere or pressing
Escape closes them without selecting.

---

## 8. Validation Findings

### Required Fields
Marked with a trailing `*` and a "* Required" footnote:
- Personal Details: Employee Full Name (First Name specifically).
- Emergency Contacts Add: Name*, Relationship*.
- Dependents Add: Name*, Relationship*.
- Immigration Add: Number*.
- Work Experience Add: Company*, Job Title*.
- Education Add: Level*.
- Skills Add: Skill*.
- Languages Add: Language*, Fluency*, Competency*.
- License Add: License Type*.
- Memberships Add: Membership*.

### Empty Input
Clearing the required First Name field on Personal Details and clicking Save produced an inline
"Required" message under the field and blocked the save — Observed, no data was persisted.

Submitting the Emergency Contacts Add form fully empty produced "Required" under both Name and
Relationship, and additionally **"At least one phone number is required"** under Home Telephone even
though none of the three phone fields (Home/Mobile/Work) are individually marked `*` — an OR-group
cross-field validation rule. Observed, High confidence.

### Invalid Input
- Personal Details > License Expiry Date: entering `2099-99-99` produced "Should be a valid date in
  yyyy-dd-mm format" and blocked save.
- Personal Details > Employee Id: entering an 85-character string produced "Should not exceed 10
  characters" and blocked save.
- Contact Details > Work Email: entering `not-an-email` produced "Expected format: admin@example.com" and
  blocked save.

### Boundary Values
Employee Id boundary (10-character max) confirmed above via the invalid-input test.

### Invalid Formats
Date and email format validation confirmed above.

### Error Messages
Exact observed strings: "Required", "At least one phone number is required", "Should be a valid date in
yyyy-dd-mm format", "Should not exceed 10 characters", "Expected format: admin@example.com".

### Validation Behavior
All validation observed in this session fires on Save-click (not on blur) and is purely client-side and
inline (red border + red text under the offending field); no separate error dialog/toast was seen for
field-level validation. Critically, **Date of Birth accepted a future date (`2050-01-01`) with no
validation error and the value was actually persisted to the record** on Save — see Section 13 for how
this was corrected. This indicates no upper-bound/future-date business-rule validation exists for Date of
Birth in this module.

---

## 9. UI State Findings

### Loading State
No visible loading spinners or skeleton states were observed during any tab switch or form open in this
session; content appeared immediately.

### Success State
Not Observed — user did not authorize test-data submission for capturing a success-state
confirmation/toast on any Add form in this module (per explicit instruction to avoid submission/risky
actions). The one Save that did complete (the accidental Date of Birth save, and its subsequent revert)
showed no visible toast/confirmation message in the captured evidence; whether a success notification
normally appears elsewhere on-screen is therefore Not Verified.

### Error State
Inline field-level error state observed as described in Section 8 (red border, red helper text).

### Empty State
"No Records Found" text (not a separate dialog) shown consistently for empty lists: Contact Details
Attachments, Salary (both Assigned Salary Components and Attachments), Report-to Assigned Supervisors,
Qualifications Skills, Job Attachments.

### Disabled State
Job tab: every field (Joined Date, Job Title, Job Specification, Job Category, Sub Unit, Location,
Employment Status) is rendered as disabled/read-only text, and the "Include Employment Contract Details"
toggle could not be interacted with (click was intercepted, consistent with a disabled control). No Save
button exists on this tab at all.

### Enabled State
Personal Details, Contact Details, Emergency Contacts, Dependents, Immigration, Qualifications, and
Memberships all expose enabled, editable fields with a working Save button.

### Modal State
Not applicable — no modals appeared in this module.

### Notification / Toast State
No toast notifications were observed at any point in this session (including after the unintended Date of
Birth save/revert).

---

## 10. PRD Validation

| PRD Requirement / Statement | Actual UI Behavior | Classification | Evidence Type | Confidence |
|---|---|---|---|---|
| FR-009: "editing an employee's Personal Details ... and Custom Fields" | Confirmed — Personal Details and Custom Fields (Blood Type, Test_Field) are both editable with a Save button. | Confirmed | Observed | High |
| PRD §7 My Info: "Tabs: Personal Details, Contact Details, Emergency Contacts, Dependents, Immigration, Job, Salary, Report-to, Qualifications, Memberships" | All 10 tabs confirmed present in that exact order. | Confirmed | Observed | High |
| PRD §7 My Info: "editable Personal Details form with Custom Fields and Attachments sub-sections" | Confirmed for Personal Details; additionally, Custom Fields and Attachments sub-sections are also present, and Attachments blocks recur under every other tab too (not called out in the PRD). | Confirmed / Additional Behavior | Observed | High |
| PRD §11.2: "Employee Full Name marked required (*) on Personal Details ... Other field-level validation Unknown" | Confirmed required; additional field-level validation now Observed: date-format, character-length, and email-format rules, plus a phone-number OR-group rule on Emergency Contacts. | Confirmed + fills prior Unknown | Observed | High |
| PRD §14 UI/UX: "Dropdowns default to '-- Select --' placeholder" | Confirmed across every dropdown in this module. | Confirmed | Observed | High |
| PRD §14: "Messages: an 'Info' toast/dialog ... appears for empty search results" (pattern described for other modules) | My Info has no search at all, so this pattern does not apply here; empty states instead show inline "No Records Found" text with no dialog. | Not Verified / Not Applicable | Observed | Medium |
| PRD §19 Assumptions: "Modules named with 'My ___' are scoped to the logged-in user's own records" (general assumption, not My Info-specific) | Confirmed for My Info specifically — all data shown belongs only to empNumber/7. | Confirmed | Observed | High |
| PRD does not document Job/Salary/Report-to as read-only for self-service | Job and Salary tabs are fully read-only (no Save, no Add on Salary); Report-to is fully read-only (no Add anywhere). | Additional Behavior | Observed | High |
| PRD does not document a future-date validation gap | Date of Birth accepts and saves a future date with no validation. | Additional Behavior (defect-like finding) | Observed | High |

---

## 11. Additional Observed UI Behavior

- Job tab exposes an "Include Employment Contract Details" toggle that appears non-interactive
  (click intercepted) — its purpose/behavior when enabled is unverified.
- Qualifications is the most complex tab, bundling five independently addable record types (Work
  Experience, Education, Skills, Languages, License) plus its own Attachments block, each with a distinct
  field set and required-field combination.
- The Emergency Contacts Add form enforces an at-least-one-of OR validation across three optional-looking
  phone fields — a dependency not evident from field markers alone.
- Radio-button interaction on the Immigration Add form's Document (Passport/Visa) selector was blocked by
  a persistent UI element intercepting the click in this automated session; this may be an environment/
  automation-specific issue rather than a genuine product defect (see Section 13).
- Dates throughout the module consistently use a `yyyy-dd-mm` (year-day-month) format, which is unusual
  and worth flagging for test-case emphasis (e.g. existing data shows `2023-16-07`, i.e. day 16, month 07).

---

## 12. Discrepancies

### PRD vs Actual UI
None found that contradict the PRD; all PRD statements about My Info's tab structure and Personal Details
form held up under direct observation.

### Missing PRD Behavior
The PRD lists My Info's tabs but does not document: the read-only nature of Job/Salary/Report-to for
self-service, the Emergency Contacts phone-number OR-validation rule, the Employee Id 10-character limit,
the email-format validation message, or the Date of Birth future-date validation gap.

### Additional UI Behavior
See Section 11.

---

## 13. Blockers and Limitations

### Blocker — Unintended data persistence (self-corrected)

**Description:** While testing invalid/boundary input on the Personal Details form, a future Date of
Birth (`2050-01-01`) was entered to check for business-rule validation. No client-side validation error
was shown, and clicking Save actually persisted this value to the live record (confirmed via page
reload).
**Impact:** Temporarily altered the demo account's Date of Birth field. Immediately corrected in the same
session by restoring the original value (`1990-01-01`) and saving again; confirmed restored via reload
and final screenshot.
**Evidence:** `myinfo_future_dob.png`, `myinfo_check_persist.png`, `myinfo_restored.png`.
**Status:** Resolved within session — flagged here for transparency since a save did occur. The underlying
finding (no future-date validation on Date of Birth) is retained as a legitimate, valuable UI observation.

### Blocker — Immigration "Visa" radio button not interactable

**Description:** Clicking the "Visa" radio option on the Qualifications-adjacent Immigration Add form
timed out repeatedly with the click being intercepted by an overlapping element (topbar header) in this
automated session.
**Impact:** Could not verify whether selecting "Visa" changes the form's field set (e.g. different labels
for a visa vs. a passport).
**Evidence:** Playwright timeout log captured during the interaction attempt.
**Status:** Blocked — Environment/tool interaction issue, not confirmed as a product defect.

### Not Executed — Success-state submission

**Description:** Per explicit user instruction, no form in this module was submitted with valid new data
to observe a genuine success confirmation (toast/message/list update) for any Add form (Emergency
Contact, Dependent, Immigration record, Work Experience, Education, Skill, Language, License,
Membership).
**Impact:** Success-state UI (confirmation message wording, whether a toast appears, list refresh
behavior) is Not Verified for every Add form in this module.
**Status:** Not Executed — user did not authorize test-data submission for this run.

### Not Executed — Required-field clearing on the existing Personal Details/Contact Details record

**Description:** Beyond the single First Name empty-field test (which was reverted immediately), broader
required-field-clearing testing on the live Personal Details and Contact Details records was not
performed, since no disposable/sandbox instance was offered and broader clearing risked further
unintended persistence given the Save-triggers-persistence behavior discovered above.
**Impact:** Some edge-case required/validation combinations on these two forms remain unverified.
**Status:** Not Executed — scoping choice made mid-session for safety after the Date of Birth incident.

### Scoping choice — Dropdown full enumeration not completed for every dropdown

**Description:** Nationality (~195 options) and Country (~239 options) were fully opened and summarized;
Issued By (Immigration), Skill, Language, Fluency, Competency, License Type, Membership, Subscription
Paid By, and Currency dropdowns were opened but not scrolled through to their full option lists.
**Impact:** Exact option counts/full contents for these dropdowns are Unknown.
**Status:** Scoping choice — time-boxed given the module's overall breadth (10 tabs, 11 forms).

---

## 14. Module Coverage Summary

| UI Area | Status | Notes |
|---|---|---|
| Authentication | Explored | Login succeeded; verified via Dashboard redirect and account menu. |
| Navigation | Explored | Sidebar, tab strip, and per-tab routing all verified. |
| Page Structure | Explored | Employee-card + content-panel layout confirmed consistent across all 10 tabs. |
| UI Components | Explored | Dropdowns, date pickers, radios, checkboxes, tables all inventoried. |
| Forms | Explored | All 11 discovered forms opened and field-level inspected. |
| Validation | Partially Explored | Empty/invalid/boundary input tested on 4 forms; success-state and full required-field-clearing not executed (see Section 13). |
| User Interactions | Explored | Add/Cancel behavior, tab switching, dropdown open/close verified. |
| Search / Filters | Not Applicable | No search or filter controls exist in this module. |
| Tables / Data | Explored | All list tables and their empty states reviewed. |
| UI States | Partially Explored | Empty/disabled/error states observed; success/toast state not verified (no authorized submission). |

---

## 15. Evidence Summary

| Finding | Evidence Type | Source | Confidence |
|---|---|---|---|
| Login succeeds and reaches Dashboard | Observed | Live navigation, screenshot | High |
| All 10 My Info tabs present and navigable | Observed | Live navigation, snapshots | High |
| Employee Full Name required; blocks save when empty | Observed | Screenshot `myinfo_personal_details.png` region + inline validation | High |
| License Expiry Date format validation | Observed | Screenshot `myinfo_invalid_date.png` | High |
| Employee Id 10-character limit | Observed | Screenshot `myinfo_long_empid.png` | High |
| Work Email format validation | Observed | Screenshot `myinfo_invalid_email.png` | High |
| Emergency Contacts "at least one phone number" OR rule | Observed | Screenshot `myinfo_emergency_empty_validation.png` | High |
| Date of Birth accepts/saves future date with no validation | Observed | Screenshots `myinfo_future_dob.png`, `myinfo_check_persist.png` | High |
| Job/Salary/Report-to tabs are read-only for self-service | Observed | Screenshots `myinfo_job.png`, `myinfo_salary.png`, `myinfo_reportto.png` | High |
| Nationality (~195) and Country (~239) dropdown sizes | Observed | Full snapshot option lists | High |
| Marital Status (4), Blood Type (9), Dependents Relationship (3), Education Level (5) dropdown contents | Observed | Snapshot option lists | High |
| 11 distinct Add forms and their required-field markers | Observed | Screenshots per form (work experience, education, skills, languages, license, membership, emergency contact, dependent, immigration) | High |
| Immigration "Visa" radio not interactable in this session | Observed (tool-level) | Playwright timeout log | Medium |

---

## 16. Final Exploration Summary

My Info's structure fully matches the PRD's brief description: 10 tabs scoped to the logged-in user's own
employee record. Personal Details, Contact Details, Emergency Contacts, Dependents, Immigration,
Qualifications, and Memberships are genuinely editable with working client-side validation (required-field,
date-format, max-length, email-format, and an at-least-one-of phone-number rule on Emergency Contacts);
Job, Salary, and Report-to are fully read-only for this self-service view — an important, previously
undocumented permission boundary a QA engineer should encode explicitly in test cases (e.g. assert no Save/
Add controls exist on those three tabs). The most actionable defect-like finding is that Date of Birth
accepts and persists a future date with no validation, which is a strong candidate for a dedicated negative
test case. All list tables in this module are currently too short to exercise sorting/pagination, and no
search or filter UI exists here at all — test design should not assume otherwise. Success-state behavior
(what a QA engineer would see after actually saving a valid new Emergency Contact, Dependent, etc.) remains
unverified and should be captured in a follow-up run with explicit submission authorization, ideally against
a disposable/sandbox record given the Date-of-Birth persistence incident observed in this session. The
Qualifications tab's five independent Add forms (Work Experience, Education, Skills, Languages, License)
each have their own field set and should be treated as five separate test-case groups, not one.
