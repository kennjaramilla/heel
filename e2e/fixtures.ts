import { test as base, expect, type Page } from '@playwright/test';

export const DEMO_PASSWORD = 'heel-demo-2026';

export async function signIn(page: Page, email: string, password = DEMO_PASSWORD) {
  await page.goto('/sign-in');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

// Fails any test whose page logs a Content Security Policy violation.
export const test = base.extend({
  page: async ({ page }, use) => {
    const violations: string[] = [];
    page.on('console', (msg) => {
      if (/Content Security Policy|Refused to/i.test(msg.text())) violations.push(msg.text());
    });
    await use(page);
    expect(violations, 'CSP violations').toEqual([]);
  },
});

export { expect };
