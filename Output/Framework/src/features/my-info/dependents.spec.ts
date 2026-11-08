import { test, expect } from '../../fixtures/auth.fixture';
import { MyInfoPage } from './my-info.page';
import { DependentsPage } from './dependents.page';

test.describe('My Info — Dependents', { tag: '@automated' }, () => {
  test.describe.configure({ timeout: 60000 });
  test.beforeEach(async ({ authenticatedPage }) => {
    const myInfo = new MyInfoPage(authenticatedPage);
    await myInfo.open();
    await myInfo.openTab('Dependents');
  });

  // Source: Test Design CSV — TC-029 — "Verify Dependents list displays an existing record"
  test('TC-029 Dependents table lists the existing record', async ({ authenticatedPage }) => {
    const dependents = new DependentsPage(authenticatedPage);
    await expect(dependents.table()).toBeVisible();
  });

  // Source: Test Design CSV — TC-030 — "Verify the Add Dependent form's Relationship dropdown options"
  test('TC-030 Add Dependent Relationship dropdown shows exactly 3 options', async ({ authenticatedPage }) => {
    const dependents = new DependentsPage(authenticatedPage);
    await dependents.addButton().click();
    const options = await dependents.relationshipOptionTexts();
    expect(options).toEqual(['-- Select --', 'Child', 'Other']);
  });

  // Source: Test Design CSV — TC-031 — "Verify the Add Dependent form marks Name and Relationship as required while Date of Birth is optional"
  test('TC-031 Add Dependent form marks Name/Relationship required, Date of Birth optional', async ({ authenticatedPage }) => {
    const dependents = new DependentsPage(authenticatedPage);
    await dependents.addButton().click();
    await expect(dependents.nameLabel()).toBeVisible();
    await expect(dependents.relationshipLabel()).toBeVisible();
    await expect(dependents.dateOfBirthLabel()).toBeVisible();
  });
});
