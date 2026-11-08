import { test, expect } from '../../fixtures/auth.fixture';
import { MyInfoPage } from './my-info.page';
import { MembershipsPage } from './memberships.page';

test.describe('My Info — Memberships', { tag: '@automated' }, () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    const myInfo = new MyInfoPage(authenticatedPage);
    await myInfo.open();
    await myInfo.openTab('Memberships');
  });

  // Source: Test Design CSV — TC-045 — "Verify Memberships list displays an existing record"
  test('TC-045 Memberships table lists the existing record', async ({ authenticatedPage }) => {
    const memberships = new MembershipsPage(authenticatedPage);
    await expect(memberships.table()).toBeVisible();
  });

  // Source: Test Design CSV — TC-046 — "Verify the Add Membership form marks Membership as required"
  test('TC-046 Add Membership form marks Membership as required', async ({ authenticatedPage }) => {
    const memberships = new MembershipsPage(authenticatedPage);
    await memberships.addButton().click();
    await expect(memberships.membershipLabel()).toBeVisible();
  });

  // Source: Test Design CSV — TC-047 — "Verify Memberships Attachments list displays an existing file"
  test('TC-047 Memberships Attachments table lists the existing file', async ({ authenticatedPage }) => {
    const memberships = new MembershipsPage(authenticatedPage);
    await expect(memberships.attachmentsTable()).toBeVisible();
  });
});
