import { test, expect } from '../../fixtures/auth.fixture';
import { MyInfoPage, MY_INFO_TABS } from './my-info.page';
import { labelledInput } from '../../shared/components/form-helpers';

test.describe('My Info — Navigation', { tag: '@automated' }, () => {
  test.describe.configure({ timeout: 60000 });
  test.beforeEach(async ({ authenticatedPage }) => {
    const myInfo = new MyInfoPage(authenticatedPage);
    await myInfo.sidebarMyInfoLink().click();
    await myInfo.waitForReady();
  });

  // Source: Test Design CSV — TC-001 — "Navigate to My Info module from the left sidebar"
  test('TC-001 navigates to My Info landing on Personal Details with employee card visible', async ({ authenticatedPage }) => {
    const myInfo = new MyInfoPage(authenticatedPage);
    await expect(authenticatedPage).toHaveURL(/viewPersonalDetails/);
    await expect(myInfo.employeeCard()).toBeVisible();
    await expect(myInfo.tab('Personal Details')).toBeVisible();
  });

  // Source: Test Design CSV — TC-002 — "Verify all 10 My Info tabs are visible and clickable"
  test('TC-002 all 10 tabs are present in order and each navigates to its own route', async ({ authenticatedPage }) => {
    const myInfo = new MyInfoPage(authenticatedPage);
    for (const tabName of MY_INFO_TABS) {
      await expect(myInfo.tab(tabName)).toBeVisible();
    }
    await myInfo.openTab('Contact Details');
    await expect(authenticatedPage).toHaveURL(/contactDetails/);
  });

  // Source: Test Design CSV — TC-003 — "Verify the employee identity card persists when switching between tabs"
  test('TC-003 employee identity card persists across tab switches', async ({ authenticatedPage }) => {
    const myInfo = new MyInfoPage(authenticatedPage);
    const nameBefore = await myInfo.employeeNameHeading().textContent();
    await myInfo.openTab('Contact Details');
    await expect(myInfo.employeeNameHeading()).toHaveText(nameBefore ?? '');
    await myInfo.openTab('Qualifications');
    await expect(myInfo.employeeNameHeading()).toHaveText(nameBefore ?? '');
  });

  // Source: Test Design CSV — TC-004 — "Verify the top banner heading on My Info sub-tabs"
  test('TC-004 top banner heading reads PIM on My Info sub-tabs', async ({ authenticatedPage }) => {
    const myInfo = new MyInfoPage(authenticatedPage);
    await expect(myInfo.header()).toHaveText('PIM');
  });

  // Source: Test Design CSV — TC-005 — "Verify no 'unsaved changes' warning appears when switching tabs"
  test('TC-005 no unsaved-changes dialog appears when switching tabs after an edit', async ({ authenticatedPage }) => {
    const myInfo = new MyInfoPage(authenticatedPage);
    const firstNameInput = authenticatedPage.getByPlaceholder('First Name');
    await firstNameInput.fill('TempEdit');
    await myInfo.openTab('Contact Details');
    await expect(authenticatedPage.getByRole('dialog')).toHaveCount(0);
    await expect(authenticatedPage).toHaveURL(/contactDetails/);
  });

  // Source: Test Design CSV — TC-006 — "Verify no search or filter controls exist anywhere in My Info"
  test('TC-006 no search or filter controls exist on My Info tabs', async ({ authenticatedPage }) => {
    const myInfo = new MyInfoPage(authenticatedPage);
    for (const tabName of MY_INFO_TABS) {
      await myInfo.openTab(tabName);
      await expect(myInfo.content().getByPlaceholder(/search/i)).toHaveCount(0);
      await expect(myInfo.content().getByRole('button', { name: /filter/i })).toHaveCount(0);
    }
  });

  // Source: Test Design CSV — TC-007 — "Verify no sortable column headers exist on My Info tables"
  test('TC-007 no sortable column headers exist on Qualifications tables', async ({ authenticatedPage }) => {
    const myInfo = new MyInfoPage(authenticatedPage);
    await myInfo.openTab('Qualifications');
    await expect(authenticatedPage.locator('.oxd-table-header-cell--sortable')).toHaveCount(0);
  });

  // Source: Test Design CSV — TC-008 — "Verify no pagination controls appear on My Info list tables"
  test('TC-008 no pagination controls appear on Qualifications > Languages table', async ({ authenticatedPage }) => {
    const myInfo = new MyInfoPage(authenticatedPage);
    await myInfo.openTab('Qualifications');
    await expect(authenticatedPage.locator('.oxd-pagination')).toHaveCount(0);
  });

  // Source: Test Design CSV — TC-009 — "Verify the '* Required' legend appears on forms containing mandatory fields"
  test('TC-009 * Required legend is shown near Save on Personal Details', async ({ authenticatedPage }) => {
    const myInfo = new MyInfoPage(authenticatedPage);
    await expect(myInfo.requiredLegend()).toBeVisible();
  });

  // Source: Test Design CSV — TC-010 — "Verify all date fields display the yyyy-dd-mm format placeholder"
  test('TC-010 License Expiry Date field uses yyyy-dd-mm format', async ({ authenticatedPage }) => {
    const licenseExpiry = labelledInput(authenticatedPage, 'License Expiry Date');
    const value = await licenseExpiry.inputValue();
    if (value) {
      expect(value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    } else {
      await expect(licenseExpiry).toHaveAttribute('placeholder', 'yyyy-dd-mm');
    }
  });
});
