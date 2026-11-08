import { Page } from '@playwright/test';
import { BasePage } from '../../shared/base.page';
import { tableAfterHeading, addButtonAfterHeading } from '../../shared/components/form-helpers';

export class MembershipsPage extends BasePage {
  table() {
    return tableAfterHeading(this.page, 'Assigned Memberships');
  }

  addButton() {
    return addButtonAfterHeading(this.page, 'Assigned Memberships');
  }

  membershipLabel() {
    return this.page.locator('form').getByText('Membership', { exact: true });
  }

  attachmentsTable() {
    return tableAfterHeading(this.page, 'Attachments');
  }
}
