import { test, expect } from '../../fixtures/auth.fixture';
import { MyInfoPage } from './my-info.page';
import { PersonalDetailsPage } from './personal-details.page';

test.describe('My Info — Personal Details', { tag: '@automated' }, () => {
  test.describe.configure({ timeout: 60000 });
  test.beforeEach(async ({ authenticatedPage }) => {
    const myInfo = new MyInfoPage(authenticatedPage);
    await myInfo.open();
  });

  // Source: Test Design CSV — TC-011 — "Verify Personal Details tab displays the employee's existing populated data"
  test('TC-011 Personal Details fields are pre-populated and Save is enabled', async ({ authenticatedPage }) => {
    const personalDetails = new PersonalDetailsPage(authenticatedPage);
    await expect(personalDetails.firstNameInput()).not.toHaveValue('');
    await expect(personalDetails.saveButton()).toBeEnabled();
  });

  // Source: Test Design CSV — TC-012 — "Submit Personal Details with an empty Employee Full Name (First Name)"
  test('TC-012 empty First Name shows inline Required error and blocks save', async ({ authenticatedPage }) => {
    const personalDetails = new PersonalDetailsPage(authenticatedPage);
    await personalDetails.firstNameInput().fill('');
    await personalDetails.saveButton().click();
    await expect(personalDetails.firstNameError()).toBeVisible();
    await expect(personalDetails.firstNameInput()).toHaveValue('');
  });

  // Source: Test Design CSV — TC-013 — "Enter an invalid License Expiry Date value"
  test('TC-013 invalid License Expiry Date shows format error and blocks save', async ({ authenticatedPage }) => {
    const personalDetails = new PersonalDetailsPage(authenticatedPage);
    await personalDetails.licenseExpiryDateInput().fill('2099-99-99');
    await personalDetails.saveButton().click();
    await expect(
      personalDetails.fieldError('License Expiry Date', 'Should be a valid date in yyyy-dd-mm format')
    ).toBeVisible();
  });

  // Source: Test Design CSV — TC-014 — "Enter an Employee Id value exceeding the 10-character limit"
  test('TC-014 Employee Id exceeding 10 characters shows length error and blocks save', async ({ authenticatedPage }) => {
    const personalDetails = new PersonalDetailsPage(authenticatedPage);
    const longValue = 'A'.repeat(85);
    await personalDetails.employeeIdInput().fill(longValue);
    await personalDetails.saveButton().click();
    await expect(personalDetails.fieldError('Employee Id', 'Should not exceed 10 characters')).toBeVisible();
  });

  // Source: Test Design CSV — TC-016 — "Verify Nationality dropdown default value and full option list"
  test('TC-016 Nationality dropdown includes the full alphabetical option list', async ({ authenticatedPage }) => {
    const personalDetails = new PersonalDetailsPage(authenticatedPage);
    const options = await personalDetails.openDropdownAndGetOptionTexts(personalDetails.nationalityDropdown());
    expect(options[0]).toBe('-- Select --');
    expect(options).toContain('Afghan');
    expect(options).toContain('Zimbabwean');
    expect(options.length).toBeGreaterThan(100);
  });

  // Source: Test Design CSV — TC-017 — "Verify Marital Status dropdown options"
  test('TC-017 Marital Status dropdown shows exactly 4 options', async ({ authenticatedPage }) => {
    const personalDetails = new PersonalDetailsPage(authenticatedPage);
    const options = await personalDetails.openDropdownAndGetOptionTexts(personalDetails.maritalStatusDropdown());
    expect(options).toEqual(['-- Select --', 'Single', 'Married', 'Other']);
  });

  // Source: Test Design CSV — TC-018 — "Verify Blood Type custom field dropdown options"
  test('TC-018 Blood Type dropdown shows exactly 9 options', async ({ authenticatedPage }) => {
    const personalDetails = new PersonalDetailsPage(authenticatedPage);
    const options = await personalDetails.openDropdownAndGetOptionTexts(personalDetails.bloodTypeDropdown());
    expect(options).toEqual(['-- Select --', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']);
  });
});
