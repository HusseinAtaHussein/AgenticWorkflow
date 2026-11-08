# Test design technique guide

Pick the technique the evidence actually supports — don't force a technique onto a finding that doesn't
warrant it. It's fine for a small module to end up with only positive/negative/UI-interaction tests and
no boundary or decision-table tests at all.

## Positive testing
Apply to every core workflow the report observed working end-to-end (e.g. valid search, valid filter
selection, valid form submission). This is almost always the first test case for any feature that has
observed behavior at all.

**Example** — report says: "User selects a Country POS option and clicks Search; the results table
updates." →
```
Test Scenario: Search with a valid Country POS selection
Steps: 1. Open Country POS dropdown. 2. Select an available option. 3. Click Search.
Expected Result: Results table updates according to the selected filter.
Design Technique: Positive
Evidence Type: Observed
```

## Negative testing
Only where the report itself provides evidence the validation/error path exists — a required-field
marker plus an observed error message, an observed "no results" state, an observed disabled button when
a field is empty, etc. If the report never tested what happens on empty/invalid input, don't invent the
negative case — that's a gap to leave for a human, not to paper over.

**Example** — report documents: "Empty Employee Name shows 'Required' below the field on submit." →
```
Test Scenario: Submit form with empty Employee Name
Expected Result: "Required" validation message appears below the Employee Name field; form is not submitted.
Design Technique: Negative
Evidence Type: Observed
```

## Boundary Value Analysis (BVA)
Only when the report documents an actual boundary (e.g. "Age field accepts 18–65", a max-length
observed on a text field, a documented min/max in the PRD that the UI enforces). Never invent numbers.
If the report says a field is numeric but never states a range, BVA doesn't apply — skip it.

**Example** — report says: "Leave Days field rejects values above 30 with an inline error." →
```
Test Scenario: Enter Leave Days value at upper boundary (30)
Test Scenario: Enter Leave Days value just above boundary (31)
Design Technique: Boundary Value Analysis
```

## Equivalence Partitioning (EP)
Use when the report gives enough detail to split inputs into meaningful valid/invalid classes — e.g. a
dropdown with several observed option categories, or a text field where the report distinguishes
"alphabetic," "numeric," and "special character" handling. Don't partition a field the report only
mentions by name with no behavioral detail.

## Decision Table Testing
Use when the report shows multiple observed conditions jointly affecting an outcome — e.g. a Search
button that behaves differently depending on which combination of two filters is set, as actually
observed. Build the table only from combinations the report evidences or that are a direct, obvious
combination of independently observed single-condition behaviors — not speculative combinations.

## State Transition Testing
Use when the report names distinct states for a component: empty, loading, loaded, success, error,
disabled, enabled, expanded, collapsed. Write test cases for the transitions the report actually
describes (e.g. "clicking Search moves the table from empty state to loaded state") rather than every
theoretically possible transition.

## Error guessing
Reserve for realistic scenarios closely adjacent to what was observed — e.g. if double-clicking a Save
button was never tested, and the report doesn't mention debounce behavior, don't guess a test case about
it unless there's a specific hint in the report (a blocker note, a mismatch, an observed glitch). Error
guessing here means "a QA-realistic extension of confirmed behavior," not "any bug a tester might
imagine."

## UI interaction testing
The most broadly applicable technique — covers click, select, search, filter, sort, paginate, tab
switch, expand/collapse, open/close modal, submit, cancel, clear/reset. Generate one per interaction the
report actually documents happening, with the actual observed result as the expected result.

## Choosing evidence_type and confidence together
- Observed + High — the report shows this exact scenario was executed and its result seen.
- Documented + Medium — the report states this as fact (e.g. from the PRD Validation table classified
  Confirmed) but the exploration didn't execute this exact variant.
- Inferred + Low or Medium — a reasonable, closely-adjacent derivation from an Observed or Documented
  finding (e.g. Observed "Search with valid input works" → Inferred "Search with a different valid value
  also works," same mechanism, not independently executed). Use sparingly — most test cases should trace
  directly to Observed or Documented findings, not to inference.
