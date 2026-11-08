import { Page } from '@playwright/test';
import { BasePage } from '../../shared/base.page';
import {
  fieldErrorNear,
  labelledInput,
  recordCountLabel,
  tableAfterHeading,
  addButtonAfterHeading,
} from '../../shared/components/form-helpers';

export class EmergencyContactsPage extends BasePage {
  table() {
    return tableAfterHeading(this.page, 'Assigned Emergency Contacts');
  }

  recordCountLabel() {
    return recordCountLabel(this.page);
  }

  addButton() {
    return addButtonAfterHeading(this.page, 'Assigned Emergency Contacts');
  }

  nameInput() {
    return labelledInput(this.page, 'Name');
  }

  relationshipInput() {
    return labelledInput(this.page, 'Relationship');
  }

  homeTelephoneInput() {
    return labelledInput(this.page, 'Home Telephone');
  }

  mobileInput() {
    return labelledInput(this.page, 'Mobile');
  }

  workTelephoneInput() {
    return labelledInput(this.page, 'Work Telephone');
  }

  requiredLegend() {
    return this.page.getByText('* Required', { exact: false });
  }

  cancelButton() {
    return this.page.getByRole('button', { name: 'Cancel' });
  }

  saveButton() {
    return this.page.getByRole('button', { name: 'Save' });
  }

  nameError() {
    return fieldErrorNear(this.page, 'Name', 'Required');
  }

  relationshipError() {
    return fieldErrorNear(this.page, 'Relationship', 'Required');
  }

  atLeastOnePhoneError() {
    return fieldErrorNear(this.page, 'Home Telephone', 'At least one phone number is required');
  }
}
