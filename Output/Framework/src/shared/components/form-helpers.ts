import { Page, Locator, expect } from '@playwright/test';

// OrangeHRM's OXD <label> elements are visual siblings of their <input> inside
// a shared .oxd-input-group wrapper, with no `for`/`id` or aria-labelledby link —
// getByLabel() never matches any field in this app. Scope by the wrapper instead.
export function labelledInput(page: Page, label: string): Locator {
  return page.locator(`.oxd-input-group:has(label:text-is("${label}")) input, .oxd-input-group:has(label:text-is("${label}")) textarea`);
}

export function dropdownByPrecedingLabel(page: Page, label: string): Locator {
  // exact:true text match against the page fails for required fields: the visible
  // label is actually "Level*" (the "*" is a separate sibling node, so the label's
  // own text node reads as exactly "Level" too) which then ties with an unrelated
  // same-named table column header elsewhere on the page, matching two elements.
  // Scoping to the open form disambiguates, matching the convention already used
  // by the other *Label() lookups in this file/page-objects.
  return page
    .locator('form')
    .getByText(label, { exact: false })
    .locator('xpath=following::div[contains(@class,"oxd-select-text")][1]');
}

export async function dropdownOptionTexts(page: Page, dropdown: Locator): Promise<string[]> {
  await dropdown.click();
  const options = page.locator('.oxd-select-dropdown .oxd-select-option');
  await options.first().waitFor();
  // Right after opening, OXD briefly renders a single-item "No Records Found"
  // placeholder row before swapping in the real option list — a stable count
  // doesn't mean render-complete, since the placeholder's own count of 1 is
  // already stable. Every real dropdown has at least a placeholder plus one
  // choice, so wait for more than one row instead.
  await expect(options).not.toHaveCount(1, { timeout: 5000 }).catch(() => {});
  return options.allTextContents();
}

export function fieldErrorNear(page: Page, fieldLabel: string, message: string): Locator {
  // contains(@class,"oxd-input-group") also substring-matches the label's own
  // inner ".oxd-input-group__label-wrapper" div; since ancestor:: is a reverse
  // axis, [1] then picks that closer-but-wrong wrapper instead of the real
  // outer group that actually holds the error message. Match the class as a
  // whole token instead.
  return page
    .getByText(fieldLabel, { exact: false })
    .locator(
      `xpath=ancestor::div[contains(concat(' ', normalize-space(@class), ' '), ' oxd-input-group ')][1]`
    )
    .getByText(message, { exact: false });
}

export function requiredMarker(page: Page, fieldLabel: string): Locator {
  return page.locator('label', { hasText: fieldLabel }).locator('xpath=.//span[contains(text(),"*")]');
}

export function recordCountLabel(page: Page): Locator {
  return page.getByText(/\(\d+\)\s*Record(s)?\s*Found/i);
}

// OrangeHRM renders each list section as a flat sequence of siblings
// (heading, separator, record-count text, table) rather than nesting them
// inside a per-section container. Use document-order ("following") lookups
// scoped from the section heading instead of ancestor-based containers.
// The OXD "table" is a <div role="table">, not a <table> element, so match by role.
export function tableAfterHeading(page: Page, headingName: string): Locator {
  return page
    .getByRole('heading', { name: headingName, exact: true })
    .locator('xpath=following::*[@role="table"][1]');
}

export function addButtonAfterHeading(page: Page, headingName: string): Locator {
  return page
    .getByRole('heading', { name: headingName, exact: true })
    .locator('xpath=following::button[1]');
}

export function textAfterHeading(page: Page, headingName: string, text: string): Locator {
  // contains(text(), ...) only checks the FIRST text-node child of each candidate
  // element; OXD wraps its text in extra empty text nodes, so that first node is
  // always "" and the predicate never matches. contains(., ...) uses the element's
  // full string-value instead, and the innermost-match guard picks the leaf span
  // rather than an ancestor container that also happens to contain the text.
  return page
    .getByRole('heading', { name: headingName, exact: true })
    .locator(
      `xpath=following::*[contains(.,"${text}") and not(.//*[contains(.,"${text}")])][1]`
    );
}

export async function resetDropdownScroll(page: Page): Promise<void> {
  const dropdown = page.locator('.oxd-select-dropdown');
  await dropdown.evaluate((el) => {
    el.scrollTop = 0;
  });
}
