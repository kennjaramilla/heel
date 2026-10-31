import { expect, signIn, test } from './fixtures';

test('an owner books, pays, and cancels for a full refund', async ({ page }) => {
  await signIn(page, 'owner@heel.dev');
  await page.goto('/trainers/pia-mendoza');

  // Pick a time a few days out, so cancelling is free.
  await page.getByRole('button', { name: 'Show more days' }).click();
  const day = page.locator('fieldset').nth(3);
  const time = (await day.getByRole('button').first().textContent())!;
  await day.getByRole('button').first().click();
  await page.getByLabel('For which pet?').selectOption({ label: 'Muning' });
  await page.getByRole('button', { name: /Continue/ }).click();

  await expect(page.getByRole('heading', { name: 'Confirm and pay' })).toBeVisible();
  await expect(page.getByRole('timer')).toContainText("We're holding this time");
  await page.getByRole('button', { name: 'Pay ₱1,800' }).click();
  await expect(page.getByRole('heading', { name: "You're booked" })).toBeVisible();

  // The booked time is no longer offered.
  const bookingUrl = page.url();
  await page.goto('/trainers/pia-mendoza');
  await page.getByRole('button', { name: 'Show more days' }).click();
  await expect(
    page.locator('fieldset').nth(3).getByRole('button', { name: time, exact: true }),
  ).toHaveCount(0);

  await page.goto(bookingUrl);
  await page.getByRole('button', { name: 'Cancel booking' }).click();
  await expect(page.getByText("You'll get the full ₱1,800 back.")).toBeVisible();
  await page.getByRole('button', { name: 'Yes, cancel and refund ₱1,800' }).click();
  await expect(page.getByRole('heading', { name: 'Cancelled' })).toBeVisible();
  await expect(page.getByText('₱1,800 was refunded to your card.')).toBeVisible();
});

test('a trainer sends a training plan and the owner can read it', async ({ page, browser }) => {
  await signIn(page, 'trainer@heel.dev');
  await page.goto('/dashboard/bookings');
  await page
    .getByRole('link', { name: /Jamie Reyes · Muning/ })
    .first()
    .click();
  await page
    .getByLabel('How did it go?')
    .fill('Muning relaxed once the litter box moved somewhere quiet.');
  await page.getByLabel('Step 1').fill('Move the litter box to a quiet corner');
  await page.getByRole('button', { name: /Send plan/ }).click();
  await expect(page.getByRole('button', { name: 'Update plan' })).toBeVisible();
  const url = page.url();

  const owner = await (await browser.newContext()).newPage();
  await signIn(owner, 'owner@heel.dev');
  await owner.goto(url);
  await expect(owner.getByText('Move the litter box to a quiet corner')).toBeVisible();
});
