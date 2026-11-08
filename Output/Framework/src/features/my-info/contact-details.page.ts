import { Page } from '@playwright/test';
import { BasePage } from '../../shared/base.page';
import {
  dropdownByPrecedingLabel,
  dropdownOptionTexts,
  fieldErrorNear,
  labelledInput,
  textAfterHeading,
} from '../../shared/components/form-helpers';

export class ContactDetailsPage extends BasePage {
  street1Input() {
    return labelledInput(this.page, 'Street 1');
  }

  cityInput() {
    return labelledInput(this.page, 'City');
  }

  workEmailInput() {
    return labelledInput(this.page, 'Work Email');
  }

  otherEmailInput() {
    return labelledInput(this.page, 'Other Email');
  }

  countryDropdown() {
    return dropdownByPrecedingLabel(this.page, 'Country');
  }

  async countryOptionTexts() {
    return dropdownOptionTexts(this.page, this.countryDropdown());
  }

  saveButton() {
    return this.page.getByRole('button', { name: 'Save' });
  }

  workEmailError(message: string) {
    return fieldErrorNear(this.page, 'Work Email', message);
  }

  attachmentsNoRecordsFound() {
    return textAfterHeading(this.page, 'Attachments', 'No Records Found');
  }
}
