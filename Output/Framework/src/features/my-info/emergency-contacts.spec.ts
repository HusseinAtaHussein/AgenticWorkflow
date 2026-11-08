import { test, expect } from '../../fixtures/auth.fixture';
import { MyInfoPage } from './my-info.page';
import { EmergencyContactsPage } from './emergency-contacts.page';

test.describe('My Info — Emergency Contacts', { tag: '@automated' }, () => {
  test.describe.configure({ timeout: 60000 });
  test.beforeEach(async ({ authenticatedPage }) => {
    const myInfo = new MyInfoPage(authenticatedPage);
    await myInfo.open();
    await myInfo.openTab('Emergency Contacts');
  });

  // Source: Test Design CSV — TC-024 — "Verify Emergency Contacts list displays existing records"
  test('TC-024 Emergency Contacts table lists existing records with record count', async ({ authenticatedPage }) => {
    const emergencyContacts = new EmergencyContactsPage(authenticatedPage);
    await expect(emergencyContacts.recordCountLabel()).toBeVisible();
    await expect(emergencyContacts.table()).toBeVisible();
  });

  // Source: Test Design CSV — TC-025 — "Open the Add Emergency Contact form and verify its required field markers"
  test('TC-025 Add form shows Name*/Relationship* required and Save/Cancel/legend', async ({ authenticatedPage }) => {
    const emergencyContacts = new EmergencyContactsPage(authenticatedPage);
    await emergencyContacts.addButton().click();
    await expect(emergencyContacts.nameInput()).toBeVisible();
    await expect(emergencyContacts.relationshipInput()).toBeVisible();
    await expect(emergencyContacts.requiredLegend()).toBeVisible();
    await expect(emergencyContacts.cancelButton()).toBeVisible();
    await expect(emergencyContacts.saveButton()).toBeVisible();
  });

  // Source: Test Design CSV — TC-026 — "Submit the Add Emergency Contact form with Name and Relationship left empty"
  test('TC-026 empty Name and Relationship show Required errors and block save', async ({ authenticatedPage }) => {
    const emergencyContacts = new EmergencyContactsPage(authenticatedPage);
    await emergencyContacts.addButton().click();
    await emergencyContacts.saveButton().click();
    await expect(emergencyContacts.nameError()).toBeVisible();
    await expect(emergencyContacts.relationshipError()).toBeVisible();
  });

  // Source: Test Design CSV — TC-027 — "Submit the Add Emergency Contact form with Name and Relationship filled but all phone fields empty"
  test('TC-027 all phone fields empty shows at-least-one-phone-required error', async ({ authenticatedPage }) => {
    const emergencyContacts = new EmergencyContactsPage(authenticatedPage);
    await emergencyContacts.addButton().click();
    await emergencyContacts.nameInput().fill('Automation Test Contact');
    await emergencyContacts.relationshipInput().fill('Friend');
    await emergencyContacts.saveButton().click();
    await expect(emergencyContacts.atLeastOnePhoneError()).toBeVisible();
  });

  // Source: Test Design CSV — TC-028 — "Cancel the Add Emergency Contact form discards entered data"
  test('TC-028 Cancel discards the Add form without saving', async ({ authenticatedPage }) => {
    const emergencyContacts = new EmergencyContactsPage(authenticatedPage);
    const countBefore = await emergencyContacts.recordCountLabel().textContent();
    await emergencyContacts.addButton().click();
    await emergencyContacts.nameInput().fill('Discard Me');
    await emergencyContacts.cancelButton().click();
    await expect(emergencyContacts.nameInput()).toHaveCount(0);
    await expect(emergencyContacts.recordCountLabel()).toHaveText(countBefore ?? '');
  });
});
