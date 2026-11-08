import { Page } from '@playwright/test';
import { BasePage } from '../../shared/base.page';
import { textAfterHeading, tableAfterHeading } from '../../shared/components/form-helpers';

export class ReportToPage extends BasePage {
  supervisorsHeading() {
    return this.page.getByRole('heading', { name: 'Assigned Supervisors', exact: true });
  }

  subordinatesHeading() {
    return this.page.getByRole('heading', { name: 'Assigned Subordinates', exact: true });
  }

  supervisorsNoRecordsFound() {
    return textAfterHeading(this.page, 'Assigned Supervisors', 'No Records Found');
  }

  subordinatesTable() {
    return tableAfterHeading(this.page, 'Assigned Subordinates');
  }

  subordinatesRecordCount() {
    return textAfterHeading(this.page, 'Assigned Subordinates', 'Record');
  }

  addButton() {
    return this.page.getByRole('button', { name: 'Add' });
  }
}
