import { Page } from '@playwright/test';
import { BasePage } from '../../shared/base.page';

export class LoginPage extends BasePage {
  usernameInput() {
    return this.page.getByPlaceholder('Username');
  }

  passwordInput() {
    return this.page.getByPlaceholder('Password');
  }

  loginButton() {
    return this.page.getByRole('button', { name: 'Login' });
  }

  async login(username: string, password: string) {
    await this.page.goto('/web/index.php/auth/login', { timeout: 60000 });
    await this.usernameInput().fill(username);
    await this.passwordInput().fill(password);
    await this.loginButton().click();
  }
}

export function createLoginPage(page: Page) {
  return new LoginPage(page);
}
