# Treating the Markdown template as the report contract

The user-supplied execution report template governs **structure and presentation**. The execution
evidence you gathered governs **content**. These never trade places — don't reshape evidence to fit the
template's expectations, and don't reshape the template's structure to fit what evidence happens to be
available.

## Before writing the report, read the template and identify

- Main title and how it's parameterized (module name, project, etc.)
- Section hierarchy — order and heading levels
- Every table and its columns
- Which sections are for summary vs. detailed execution vs. bugs vs. blockers vs. evidence vs. final
  conclusion
- Any metadata fields (project, URL, dates, environment, browser, etc.)
- Any placeholders (e.g. `<Module Name>`, `{{date}}`, `TBD`) — these get replaced with real values, never
  left as literal placeholder text and never silently deleted
- The template's own terminology — if it calls something "Execution Notes" rather than "Comments," match
  its wording

## Rules while populating it

- **Preserve section order and heading hierarchy.** Don't reorder sections even if a different order
  feels more natural to you.
- **Preserve table structures.** If the template's bug table has six columns, use those six columns —
  don't add or drop columns because you decided a different set was more useful; if you have genuinely
  additional evidence-backed information that doesn't fit, note it in a prose sub-section near the table
  rather than changing the contract.
- **Keep every applicable section**, even a thin one. A section with nothing to report should still
  exist, populated with `Not Available` / `Not Verified` / `N/A` and a short reason — not silently
  deleted. Only omit a section if the template explicitly says it's optional and doesn't apply.
- **Never invent content just to fill a field.** An empty-seeming field is honest; a fabricated one is
  not. If the template asks for "Environment" and you don't actually know the OS/browser version beyond
  what Playwright reports, say what you do know and mark the rest `Not Available`.
- **Add execution-specific detail the template implies but doesn't spell out** (e.g. if the template has
  a generic "Notes" column, use it for things like "Test Design Issue — locator outdated" when relevant)
  — this is filling the contract's intent, not breaking it.

## When there's no template supplied

This skill's Step 0 asks for a template as one of the five required inputs — if the user genuinely has
none, ask whether they want to use the standard structure from the companion skills (`ui-explorer`'s and
`test-designer`'s reports follow a consistent numbered-section style: Overview → Scope/Methodology →
Detailed Findings → Summary tables → Blockers → Conclusion) as a fallback, rather than inventing an
unrelated structure from scratch.
