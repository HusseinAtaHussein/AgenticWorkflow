import { test as base, expect, Page } from '@playwright/test';
import { LoginPage } from '../features/auth/login.page';

type AuthFixtures = {
  authenticatedPage: Page;
};

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. Set it before running tests.`);
  }
  return value;
}

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    const username = requiredEnv('ORANGEHRM_USERNAME');
    const password = requiredEnv('ORANGEHRM_PASSWORD');

    const loginPage = new LoginPage(page);
    await loginPage.login(username, password);
    await expect(page.getByText('Dashboard').first()).toBeVisible({ timeout: 30000 });

    await use(page);
  },
});

export { expect };
