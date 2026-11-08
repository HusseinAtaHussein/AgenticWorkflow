import { Page } from '@playwright/test';
import { BasePage } from '../../shared/base.page';
import { labelledInput } from '../../shared/components/form-helpers';

export class PersonalDetailsPage extends BasePage {
  firstNameInput() {
    // "First Name" is a placeholder within the grouped "Employee Full Name" field,
    // not its own labelled input.
    return this.page.getByPlaceholder('First Name');
  }

  employeeIdInput() {
    return labelledInput(this.page, 'Employee Id');
  }

  otherIdInput() {
    return labelledInput(this.page, 'Other Id');
  }

  driversLicenseInput() {
    return labelledInput(this.page, "Driver's License Number");
  }

  licenseExpiryDateInput() {
    return labelledInput(this.page, 'License Expiry Date');
  }

  nationalityDropdown() {
    return this.page.getByText('Nationality').locator('xpath=following::div[contains(@class,"oxd-select-text")][1]');
  }

  maritalStatusDropdown() {
    return this.page.getByText('Marital Status').locator('xpath=following::div[contains(@class,"oxd-select-text")][1]');
  }

  dateOfBirthInput() {
    return labelledInput(this.page, 'Date of Birth');
  }

  genderMaleRadio() {
    return this.page.getByRole('radio', { name: 'Male' });
  }

  genderFemaleRadio() {
    return this.page.getByRole('radio', { name: 'Female' });
  }

  bloodTypeDropdown() {
    return this.page.getByText('Blood Type').locator('xpath=following::div[contains(@class,"oxd-select-text")][1]');
  }

  saveButton() {
    // The page renders two separate <form>s: the main Personal Details form
    // (name/id/license/nationality/etc., all first-form fields this page object
    // targets) and a second form solely for the Blood Type/Test_Field custom
    // fields — each with its own "Save" button, so the unscoped role lookup is
    // ambiguous. Scope to the first (main) form.
    return this.page.locator('form').first().getByRole('button', { name: 'Save' });
  }

  firstNameError() {
    // "First Name" is a placeholder, not a labelled field (see firstNameInput),
    // so the generic label-text-based fieldError() lookup has nothing to anchor
    // on here; anchor on the input itself instead.
    return this.firstNameInput()
      .locator(
        `xpath=ancestor::div[contains(concat(' ', normalize-space(@class), ' '), ' oxd-input-group ')][1]`
      )
      .getByText('Required');
  }

  requiredErrorFor(fieldLabel: string) {
    return this.page
      .getByText(fieldLabel, { exact: false })
      .locator(
        `xpath=ancestor::div[contains(concat(' ', normalize-space(@class), ' '), ' oxd-input-group ')][1]`
      )
      .getByText('Required');
  }

  fieldError(fieldContainerLabel: string, message: string) {
    return this.page
      .getByText(fieldContainerLabel, { exact: false })
      .locator(
        `xpath=ancestor::div[contains(concat(' ', normalize-space(@class), ' '), ' oxd-input-group ')][1]`
      )
      .getByText(message, { exact: false });
  }

  async openDropdownAndGetOptionTexts(dropdown: ReturnType<PersonalDetailsPage['nationalityDropdown']>) {
    await dropdown.click();
    const options = this.page.locator('.oxd-select-dropdown .oxd-select-option');
    await options.first().waitFor();
    // The listbox auto-scrolls to the currently selected value; reset scroll
    // to the top and wait for the re-render so the list reads from "-- Select --".
    await this.page.locator('.oxd-select-dropdown').evaluate((el) => {
      el.scrollTop = 0;
    });
    await this.page.waitForFunction(() => {
      const first = document.querySelector('.oxd-select-dropdown .oxd-select-option');
      return first?.textContent?.trim() === '-- Select --';
    });
    return options.allTextContents();
  }
}
