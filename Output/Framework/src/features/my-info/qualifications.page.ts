import { Page } from '@playwright/test';
import { BasePage } from '../../shared/base.page';
import {
  dropdownByPrecedingLabel,
  dropdownOptionTexts,
  tableAfterHeading,
  addButtonAfterHeading,
  textAfterHeading,
} from '../../shared/components/form-helpers';

export class QualificationsPage extends BasePage {
  sectionHeading(name: string) {
    return this.page.getByRole('heading', { name, exact: true });
  }

  addButtonFor(sectionHeading: string) {
    return addButtonAfterHeading(this.page, sectionHeading);
  }

  workExperienceTable() {
    return tableAfterHeading(this.page, 'Work Experience');
  }

  educationTable() {
    return tableAfterHeading(this.page, 'Education');
  }

  skillsTable() {
    return tableAfterHeading(this.page, 'Skills');
  }

  languagesTable() {
    return tableAfterHeading(this.page, 'Languages');
  }

  licenseTable() {
    return tableAfterHeading(this.page, 'License');
  }

  private openFormLabel(text: string) {
    return this.page.locator('form').getByText(text, { exact: true });
  }

  companyLabel() {
    return this.openFormLabel('Company');
  }

  jobTitleLabel() {
    return this.openFormLabel('Job Title');
  }

  levelDropdown() {
    return dropdownByPrecedingLabel(this.page, 'Level');
  }

  async levelOptionTexts() {
    return dropdownOptionTexts(this.page, this.levelDropdown());
  }

  skillLabel() {
    return this.openFormLabel('Skill');
  }

  languageLabel() {
    return this.openFormLabel('Language');
  }

  fluencyLabel() {
    return this.openFormLabel('Fluency');
  }

  competencyLabel() {
    return this.openFormLabel('Competency');
  }

  licenseTypeLabel() {
    return this.openFormLabel('License Type');
  }

  noRecordsFoundWithin(sectionHeading: string) {
    return textAfterHeading(this.page, sectionHeading, 'No Records Found');
  }
}
