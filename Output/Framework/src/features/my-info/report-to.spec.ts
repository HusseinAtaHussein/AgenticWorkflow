import { test, expect } from '../../fixtures/auth.fixture';
import { MyInfoPage } from './my-info.page';
import { ReportToPage } from './report-to.page';

test.describe('My Info — Report-to (Read-only)', { tag: '@automated' }, () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    const myInfo = new MyInfoPage(authenticatedPage);
    await myInfo.open();
    await myInfo.openTab('Report-to');
  });

  // Source: Test Design CSV — TC-051 — "Verify Report-to tab is fully read-only with no Add controls"
  test('TC-051 Supervisors empty, 1 Subordinate listed, no Add button anywhere', async ({ authenticatedPage }) => {
    const reportTo = new ReportToPage(authenticatedPage);
    await expect(reportTo.supervisorsNoRecordsFound()).toBeVisible();
    await expect(reportTo.subordinatesRecordCount()).toBeVisible();
    await expect(authenticatedPage.getByRole('button', { name: 'Add' })).toHaveCount(0);
  });
});
