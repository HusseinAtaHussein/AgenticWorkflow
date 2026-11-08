import { Page } from '@playwright/test';
import { BasePage } from '../../shared/base.page';

export const MY_INFO_TABS = [
  'Personal Details',
  'Contact Details',
  'Emergency Contacts',
  'Dependents',
  'Immigration',
  'Job',
  'Salary',
  'Report-to',
  'Qualifications',
  'Memberships',
] as const;

export type MyInfoTab = (typeof MY_INFO_TABS)[number];

export class MyInfoPage extends BasePage {
  async open() {
    await this.gotoPath('/web/index.php/pim/viewMyDetails');
  }

  employeeCard() {
    return this.page.locator('.orangehrm-edit-employee-name, .employee-name-tab-card').first();
  }

  employeeNameHeading() {
    return this.page.locator('.orangehrm-edit-employee-name h6, .employee-name-tab-card h6').first();
  }

  tabStrip() {
    return this.page.locator('.orangehrm-tabs, .oxd-topbar-body-nav').first();
  }

  tab(name: MyInfoTab) {
    return this.page.getByRole('link', { name, exact: true });
  }

  async openTab(name: MyInfoTab) {
    await this.tab(name).click();
    await this.waitForReady();
  }

  activeTabLocator() {
    return this.page.locator('a.--active, a[aria-current="page"]').first();
  }

  sidebarMyInfoLink() {
    return this.page.getByRole('link', { name: 'My Info' });
  }

  activeSidebarItem() {
    return this.page.locator('.oxd-main-menu-item--active', { hasText: 'My Info' });
  }

  requiredLegend() {
    return this.page.getByText('* Required', { exact: false });
  }

  saveButton() {
    return this.page.getByRole('button', { name: 'Save' });
  }

  addButton(scopedWithin?: string) {
    if (scopedWithin) {
      return this.page.locator(`text=${scopedWithin}`).locator('..').getByRole('button', { name: 'Add' });
    }
    return this.page.getByRole('button', { name: 'Add' });
  }

  attachmentsSection() {
    return this.page.locator('text=Attachments').locator('xpath=ancestor::div[contains(@class, "oxd-sheet")]').first();
  }

  noRecordsFoundText() {
    return this.page.getByText('No Records Found');
  }

  content() {
    // Scopes lookups to the My Info tab content, excluding the app's persistent
    // sidebar chrome (e.g. its own global module-search box), which is present
    // on every page in the app and unrelated to what a given My Info tab renders.
    return this.page.locator('.orangehrm-edit-employee-content');
  }
}
