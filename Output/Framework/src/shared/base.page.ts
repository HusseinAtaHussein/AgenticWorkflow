import { Page } from '@playwright/test';

export class BasePage {
  constructor(protected readonly page: Page) {}

  async gotoPath(path: string) {
    await this.page.goto(path, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await this.waitForReady();
  }

  async waitForReady() {
    await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  }

  header() {
    return this.page.locator('.oxd-topbar-header-breadcrumb h6');
  }
}
