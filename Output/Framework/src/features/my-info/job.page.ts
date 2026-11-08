import { Page } from '@playwright/test';
import { BasePage } from '../../shared/base.page';

export class JobPage extends BasePage {
  jobDetailsHeading() {
    return this.page.getByRole('heading', { name: 'Job Details' });
  }

  joinedDateInput() {
    return this.page.getByPlaceholder('yyyy-dd-mm');
  }

  fieldLabelText(label: string) {
    return this.page.getByText(label, { exact: true });
  }

  editableTextboxNamed(label: string) {
    return this.page.getByRole('textbox', { name: label });
  }

  saveButton() {
    return this.page.getByRole('button', { name: 'Save' });
  }
}
