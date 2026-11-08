import { test, expect } from '../../fixtures/auth.fixture';
import { MyInfoPage } from './my-info.page';
import { tableAfterHeading, textAfterHeading } from '../../shared/components/form-helpers';

test.describe('My Info — Attachments (General)', { tag: '@automated' }, () => {
  // Source: Test Design CSV — TC-052 — "Verify Attachments empty state text is consistent across tabs with no attachments"
  test('TC-052 Attachments empty state shows No Records Found with headers visible', async ({ authenticatedPage }) => {
    const myInfo = new MyInfoPage(authenticatedPage);
    await myInfo.open();
    await myInfo.openTab('Contact Details');

    const attachmentsHeading = authenticatedPage.getByRole('heading', { name: 'Attachments', exact: true });
    await expect(attachmentsHeading).toBeVisible();
    await expect(textAfterHeading(authenticatedPage, 'Attachments', 'No Records Found')).toBeVisible();
    await expect(tableAfterHeading(authenticatedPage, 'Attachments').getByText('File Name')).toBeVisible();
  });
});
