import { test, expect } from '../../fixtures/auth.fixture';
import { MyInfoPage } from './my-info.page';

test.describe('My Info — Salary (Read-only)', { tag: '@automated' }, () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    const myInfo = new MyInfoPage(authenticatedPage);
    await myInfo.open();
    await myInfo.openTab('Salary');
  });

  // Source: Test Design CSV — TC-050 — "Verify Salary tab shows an empty state with no Add button anywhere on the page"
  test('TC-050 Salary shows No Records Found in both sections and no Add button', async ({ authenticatedPage }) => {
    const noRecordsFoundEntries = authenticatedPage.getByText('No Records Found');
    await expect(noRecordsFoundEntries).toHaveCount(2);
    await expect(authenticatedPage.getByRole('button', { name: 'Add' })).toHaveCount(0);
  });
});
