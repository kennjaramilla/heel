import { expect, signIn, test } from './fixtures';

test('private pages send visitors to sign in', async ({ page }) => {
  await page.goto('/dashboard/bookings');
  await expect(page).toHaveURL(/\/sign-in\?next=%2Fdashboard%2Fbookings/);
});

test('owners cannot open the admin area or trainer tools', async ({ page }) => {
  await signIn(page, 'owner@heel.dev');
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto('/dashboard/availability');
  await expect(page).toHaveURL(/\/dashboard$/);
});

test('an admin can see the overview and audit log', async ({ page }) => {
  await signIn(page, 'admin@heel.dev', 'e2e-admin-password');
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'Money, last 30 days' })).toBeVisible();
  await page.getByRole('link', { name: 'Audit log' }).click();
  await expect(page.getByText('Entries are never edited or deleted.')).toBeVisible();
});

test('security headers are set', async ({ request }) => {
  const res = await request.get('/');
  expect(res.headers()['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(res.headers()['x-frame-options']).toBe('DENY');
  expect(res.headers()['x-powered-by']).toBeUndefined();
});
