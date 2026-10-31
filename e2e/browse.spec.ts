import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures';

test('a visitor can find a cat trainer and see their open times', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Find a trainer' }).first().click();
  await expect(page.getByRole('heading', { name: 'Find a trainer' })).toBeVisible();

  const filters = page.getByRole('complementary');
  await filters.getByText('Cats', { exact: true }).click();
  await expect(page).toHaveURL(/species=cat/);
  await filters.getByText('Litter box issues').click();
  await expect(page).toHaveURL(/specialty=litter-box/);
  await expect(page.getByText('1 trainer', { exact: true })).toBeVisible();

  await page.getByRole('link', { name: 'Pia Mendoza' }).click();
  await expect(page.getByRole('heading', { name: 'Pia Mendoza' })).toBeVisible();
  await expect(page.getByText('Times in Asia/Manila')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Sign in to book' })).toBeVisible();
});

test('bad search links still work', async ({ page }) => {
  await page.goto('/trainers?species=lizard&page=abc&sort=random');
  await expect(page.getByText('8 trainers')).toBeVisible();
});

for (const path of ['/', '/trainers', '/trainers/sam-villanueva', '/sign-in', '/sign-up']) {
  test(`no serious accessibility issues on ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const serious = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    expect(serious.map((v) => `${v.id}: ${v.nodes.length} element(s)`)).toEqual([]);
  });
}
