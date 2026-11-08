import { test, expect } from '../../fixtures/auth.fixture';
import { MyInfoPage } from './my-info.page';
import { ContactDetailsPage } from './contact-details.page';

test.describe('My Info — Contact Details', { tag: '@automated' }, () => {
  test.describe.configure({ timeout: 60000 });
  test.beforeEach(async ({ authenticatedPage }) => {
    const myInfo = new MyInfoPage(authenticatedPage);
    await myInfo.open();
    await myInfo.openTab('Contact Details');
  });

  // Source: Test Design CSV — TC-020 — "Verify Contact Details tab displays the employee's existing populated data"
  test('TC-020 Contact Details fields are pre-populated with a Save button present', async ({ authenticatedPage }) => {
    const contactDetails = new ContactDetailsPage(authenticatedPage);
    await expect(contactDetails.saveButton()).toBeVisible();
    await expect(contactDetails.cityInput()).toBeVisible();
  });

  // Source: Test Design CSV — TC-021 — "Enter an invalid Work Email format"
  test('TC-021 invalid Work Email format shows error and blocks save', async ({ authenticatedPage }) => {
    const contactDetails = new ContactDetailsPage(authenticatedPage);
    await contactDetails.workEmailInput().fill('not-an-email');
    await contactDetails.saveButton().click();
    await expect(contactDetails.workEmailError('Expected format: admin@example.com')).toBeVisible();
  });

  // Source: Test Design CSV — TC-022 — "Verify Country dropdown default value and full option list"
  test('TC-022 Country dropdown includes the full alphabetical option list', async ({ authenticatedPage }) => {
    const contactDetails = new ContactDetailsPage(authenticatedPage);
    const options = await contactDetails.countryOptionTexts();
    expect(options[0]).toBe('-- Select --');
    expect(options).toContain('Afghanistan');
    expect(options).toContain('Zimbabwe');
    expect(options.length).toBeGreaterThan(150);
  });

  // Source: Test Design CSV — TC-023 — "Verify Contact Details Attachments section shows an empty state"
  test('TC-023 Contact Details Attachments shows No Records Found', async ({ authenticatedPage }) => {
    const contactDetails = new ContactDetailsPage(authenticatedPage);
    await expect(contactDetails.attachmentsNoRecordsFound()).toBeVisible();
  });
});
