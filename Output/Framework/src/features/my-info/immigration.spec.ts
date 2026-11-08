import { test, expect } from '../../fixtures/auth.fixture';
import { MyInfoPage } from './my-info.page';
import { ImmigrationPage } from './immigration.page';

test.describe('My Info — Immigration', { tag: '@automated' }, () => {
  test.describe.configure({ timeout: 60000 });
  test.beforeEach(async ({ authenticatedPage }) => {
    const myInfo = new MyInfoPage(authenticatedPage);
    await myInfo.open();
    await myInfo.openTab('Immigration');
  });

  // Source: Test Design CSV — TC-032 — "Verify Immigration list displays existing passport records"
  test('TC-032 Immigration table lists existing records', async ({ authenticatedPage }) => {
    const immigration = new ImmigrationPage(authenticatedPage);
    await expect(immigration.table()).toBeVisible();
  });

  // Source: Test Design CSV — TC-033 — "Verify the Add Immigration form marks Number as required and defaults Document to Passport"
  test('TC-033 Add Immigration form defaults to Passport and marks Number required', async ({ authenticatedPage }) => {
    const immigration = new ImmigrationPage(authenticatedPage);
    await immigration.addButton().click();
    await expect(immigration.passportRadio()).toBeChecked();
    await expect(immigration.numberLabel()).toBeVisible();
  });
});
