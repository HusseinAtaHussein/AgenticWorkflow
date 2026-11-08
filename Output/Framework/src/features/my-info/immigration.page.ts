import { Page } from '@playwright/test';
import { BasePage } from '../../shared/base.page';
import { tableAfterHeading, addButtonAfterHeading } from '../../shared/components/form-helpers';

export class ImmigrationPage extends BasePage {
  table() {
    return tableAfterHeading(this.page, 'Assigned Immigration Records');
  }

  addButton() {
    return addButtonAfterHeading(this.page, 'Assigned Immigration Records');
  }

  passportRadio() {
    return this.page.getByRole('radio', { name: 'Passport' });
  }

  visaRadio() {
    return this.page.getByRole('radio', { name: 'Visa' });
  }

  numberLabel() {
    return this.page.locator('form').getByText('Number', { exact: true });
  }
}
