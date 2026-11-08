import { Page } from '@playwright/test';
import { BasePage } from '../../shared/base.page';

export class SalaryPage extends BasePage {
  assignedSalaryComponentsNoRecords() {
    return this.page.getByText('No Records Found').first();
  }

  addButton() {
    return this.page.getByRole('button', { name: 'Add' });
  }
}
