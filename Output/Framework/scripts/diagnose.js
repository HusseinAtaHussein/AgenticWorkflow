const { chromium } = require('playwright');
const BASE_URL = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';
const USERNAME = process.env.LOGIN_USERNAME;
const PASSWORD = process.env.LOGIN_PASSWORD;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.locator('input[name="username"]').fill(USERNAME);
  await page.locator('input[name="password"]').fill(PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/dashboard/**', { timeout: 15000 });
  await page.getByRole('link', { name: 'My Info' }).click();
  await page.waitForURL('**/viewPersonalDetails**', { timeout: 15000 });
  await page.waitForTimeout(1500);

  const html = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('*')).find(e => e.textContent.trim() === 'Personal Details' && e.children.length === 0);
    if (!el) return 'NOT FOUND';
    let node = el;
    for (let i = 0; i < 5 && node; i++) {
      node = node.parentElement;
    }
    return node ? node.outerHTML.slice(0, 3000) : 'no ancestor';
  });
  console.log('=== ANCESTOR HTML ===');
  console.log(html);

  await browser.close();
})();
