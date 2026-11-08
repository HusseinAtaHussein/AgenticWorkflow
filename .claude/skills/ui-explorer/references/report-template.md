# UI exploration report template

Fill this exact structure for the selected module. Every heading must appear even if the finding is
"Not Verified" or "N/A" — don't delete sections that turn out empty, and don't pad them with invented
content either. Replace `<ModuleName>` with the actual module name. Nothing in this report may describe
an API call, endpoint, HTTP method, status code, request/response payload, or network request.

```markdown
# <ModuleName> — UI Exploration Findings

## 1. Exploration Overview

### Project
### Project URL
### PRD File
### Selected Module
### Exploration Date

---

## 2. Exploration Scope

### Included Scope
### Excluded Scope
### Prerequisites Accessed

(e.g. "Prerequisite: Login — Reason: Required to authenticate before accessing Dashboard. Not explored
beyond what was needed to log in.")

---

## 3. Exploration Methodology

### Tools Used
### Evidence Sources
### Authentication Status

One of: Successful / Failed / Blocked. Never the username or password itself.

### Safety Restrictions

---

## 4. Module Overview

### Module Purpose
### Module Entry Point
### Module Route
### Related Screens
### Related Features

---

## 5. Navigation Findings

### Main Navigation
### Module Navigation
### Breadcrumbs
### Tabs
### Links
### Navigation Behavior

---

## 6. UI Components

### Page Structure
### Buttons
### Input Fields
### Dropdowns
### Multi-selects
### Radio Buttons
### Checkboxes
### Date Pickers
### Tables
### Cards
### Modals / Dialogs
### Other Observed Components

---

## 7. User Interaction Findings

### Buttons and Actions
### Forms
### Search
### Filters
### Sorting
### Pagination
### Expand / Collapse
### Tabs
### Other Interactions

---

## 8. Validation Findings

### Required Fields
### Empty Input
### Invalid Input
### Boundary Values
### Invalid Formats
### Error Messages
### Validation Behavior

---

## 9. UI State Findings

### Loading State
### Success State
### Error State
### Empty State
### Disabled State
### Enabled State
### Modal State
### Notification / Toast State

---

## 10. PRD Validation

| PRD Requirement / Statement | Actual UI Behavior | Classification | Evidence Type | Confidence |
|---|---|---|---|---|

Classifications: Confirmed / Partially Confirmed / Mismatch / Additional Behavior / Not Verified / Blocked

---

## 11. Additional Observed UI Behavior

UI behavior discovered during exploration that the PRD doesn't describe.

---

## 12. Discrepancies

### PRD vs Actual UI
### Missing PRD Behavior
### Additional UI Behavior

---

## 13. Blockers and Limitations

Use this block per blocker:

### Blocker

**Description:**
**Impact:**
**Evidence:**
**Status:** Blocked

---

## 14. Module Coverage Summary

| UI Area | Status | Notes |
|---|---|---|
| Authentication | | |
| Navigation | | |
| Page Structure | | |
| UI Components | | |
| Forms | | |
| Validation | | |
| User Interactions | | |
| Search / Filters | | |
| Tables / Data | | |
| UI States | | |

Status per row: Explored / Partially Explored / Blocked / Not Applicable

---

## 15. Evidence Summary

| Finding | Evidence Type | Source | Confidence |
|---|---|---|---|

---

## 16. Final Exploration Summary

A concise, evidence-supported-only summary of what this module's UI actually does, how well it matches
the PRD, and what a QA engineer should know before writing UI test cases or automation against it. Do not
include assumptions as facts.
```
