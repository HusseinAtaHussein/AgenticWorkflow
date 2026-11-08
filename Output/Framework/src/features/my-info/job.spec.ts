import { test, expect } from '../../fixtures/auth.fixture';
import { MyInfoPage } from './my-info.page';
import { JobPage } from './job.page';

const READ_ONLY_TEXT_LABELS = [
  'Job Title',
  'Job Specification',
  'Job Category',
  'Sub Unit',
  'Location',
  'Employment Status',
];

test.describe('My Info — Job (Read-only)', { tag: '@automated' }, () => {
  test.describe.configure({ timeout: 60000 });
  test.beforeEach(async ({ authenticatedPage }) => {
    const myInfo = new MyInfoPage(authenticatedPage);
    await myInfo.open();
    await myInfo.openTab('Job');
  });

  // Source: Test Design CSV — TC-048 — "Verify Job tab fields are read-only and no Save button is present"
  test('TC-048 Job fields are read-only and no Save button exists', async ({ authenticatedPage }) => {
    const job = new JobPage(authenticatedPage);
    await expect(job.joinedDateInput()).toBeDisabled();
    for (const label of READ_ONLY_TEXT_LABELS) {
      await expect(job.fieldLabelText(label)).toBeVisible();
      await expect(job.editableTextboxNamed(label)).toHaveCount(0);
    }
    await expect(job.saveButton()).toHaveCount(0);
  });
});
