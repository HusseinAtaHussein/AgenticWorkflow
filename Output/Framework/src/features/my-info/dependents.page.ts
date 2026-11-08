import { Page } from '@playwright/test';
import { BasePage } from '../../shared/base.page';
import {
  dropdownByPrecedingLabel,
  dropdownOptionTexts,
  tableAfterHeading,
  addButtonAfterHeading,
} from '../../shared/components/form-helpers';

export class DependentsPage extends BasePage {
  table() {
    return tableAfterHeading(this.page, 'Assigned Dependents');
  }

  addButton() {
    return addButtonAfterHeading(this.page, 'Assigned Dependents');
  }

  nameLabel() {
    return this.page.locator('form').getByText('Name', { exact: true });
  }

  relationshipLabel() {
    return this.page.locator('form').getByText('Relationship', { exact: true });
  }

  dateOfBirthLabel() {
    return this.page.locator('form').getByText('Date of Birth', { exact: true });
  }

  relationshipDropdown() {
    return dropdownByPrecedingLabel(this.page, 'Relationship');
  }

  async relationshipOptionTexts() {
    return dropdownOptionTexts(this.page, this.relationshipDropdown());
  }
}
