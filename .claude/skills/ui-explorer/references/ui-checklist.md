# Module UI exploration checklist

Work through the items relevant to the selected module. Skip items that don't apply — e.g. a read-only
dashboard has no CRUD section to report, and that's a correct outcome, not a gap. Nothing here ever
extends to APIs, network requests, or backend behavior — if a check would require inspecting a request or
response, skip it; it's out of scope for this skill.

**Coverage is per-instance, not per-label.** If the module has more than one Add/Edit form (separate tabs,
accordions, or nested lists each with their own form), or more than one dropdown, every item below applies
to each individual form and each individual dropdown found — not once for the module as a whole. Two forms
or dropdowns that share a label still need to be checked independently; a shared label is not evidence of
a shared schema. See SKILL.md Step 2 and Step 6 for how this full inventory gets confirmed before the
report is written.

## Navigation
- Menu entry point (sidebar, top nav, tab) that leads to the module
- Page URL / route once loaded
- Page title
- Breadcrumbs
- Internal tabs or sub-navigation within the module
- Links leading elsewhere from the module
- Back / next / previous navigation
- Child pages reachable from the module

## Page structure and components
- Sections, cards, panels, widgets
- Tables
- Forms
- Modals / dialogs reachable from the module
- Expandable/collapsible sections
- Notifications visible on load

## UI controls
- Buttons (label, what they trigger, actual result)
- Text fields / text areas (label, placeholder, required marker, default value, enabled/disabled)
- Dropdowns / selects — open each one and capture the full option list (not just what's visible without
  scrolling); for lists longer than ~20 options, a summary of first few / last few / total count is fine,
  but only after actually opening and scrolling through it
- Multi-select controls
- Radio buttons
- Checkboxes
- Date pickers
- File upload controls
- Search fields
- Filter controls
- Links

Only document controls that actually render — don't infer a control exists because a similar app usually
has one. For important controls, record: label, visible state, the interaction performed, and the result
actually observed.

## Forms and fields
- Field labels, placeholders, input types
- Default values
- Required vs. optional indication — only report this if actually observed (e.g. an asterisk, or a
  validation error on submit), not assumed from field importance
- Enabled / disabled state
- Dropdown / radio / checkbox options as actually rendered

## Validation
For every form — not just the ones with the simplest field sets — test both of these, not empty-submit
alone:
- Empty required fields.
- One deliberately invalid value per field type present in the form: a malformed date in a date field,
  non-numeric text in a numeric field, an over-length string in a bounded text field, an out-of-range
  value where a range applies, an invalid format where one is implied (email, phone, etc.).

Also test any cross-field validation the form implies: OR-groups (at least one of several fields required),
fields that become required only conditionally on another field's value, and mutually exclusive fields.

Record the exact error message and behavior observed — never invent a plausible-sounding message. If a
field looks required but wasn't actually tested, mark it Not Verified.

## Tables and data
- Table title, columns, visible row count (approximate, not an exact live-data claim)
- Search
- Filtering
- Sorting (verified by actually clicking, not assumed from a sortable-looking header)
- Pagination, page size
- Row-level actions
- Empty-state rendering (only if actually triggered)
- Loading-state rendering (only if actually observed, e.g. a spinner caught mid-load)

## Search and filtering
- Search fields, filter controls (dropdown/multi-select/date), clear/reset controls
- Actual search results, filtered results, empty-results state
- Don't assume a filter works because the control exists — verify by applying it and observing the
  result

## UI states
Loading, success, error, empty, disabled, enabled, expanded, collapsed, modal open/closed, confirmation
dialog, toast/notification — record only states actually triggered and seen.

## CRUD (safe portions only)
- Create: if the user authorized a valid-record submission per form type in Step 1, submit exactly one
  valid record per distinct form and record the observed success state; otherwise record `Success state:
  Not Observed — user did not authorize test-data submission` rather than leaving it blank
- Read: viewing/detail behavior
- Update: attempt with safe test data if non-destructive and reversible; record actual result. For the
  module's main editable/core record (one that already holds real existing data), only attempt Save-time
  required-field-clearing tests if the user specifically authorized that in Step 1 — otherwise record it
  as a named, explained gap rather than skipping it silently
- Delete / other destructive actions: do not execute without explicit user authorization — record as
  `Not Executed — potentially destructive`, noting what it appears to do based on its label alone
