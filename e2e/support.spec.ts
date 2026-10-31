import { expect, signIn, test } from './fixtures';

test('an owner asks for help and an admin replies', async ({ browser }) => {
  const subject = `Question ${Date.now()}`;

  const owner = await browser.newPage();
  await signIn(owner, 'owner@heel.dev');
  await owner.goto('/dashboard/support/new');
  await owner.getByLabel('Subject').fill(subject);
  await owner.getByLabel('How can we help?').fill('Can I move my consult to next week?');
  await owner.getByRole('button', { name: 'Send to Heel support' }).click();
  await expect(owner.getByRole('heading', { name: subject })).toBeVisible();
  await expect(owner.getByText('Waiting on Heel')).toBeVisible();

  const admin = await browser.newPage();
  await signIn(admin, 'admin@heel.dev', 'e2e-admin-password');
  await admin.goto('/admin/support');
  await admin.getByRole('link', { name: subject }).click();
  await admin.getByLabel('Reply as Heel support').fill('Yes, cancel and rebook for a full refund.');
  await admin.getByRole('button', { name: 'Send reply' }).click();
  await expect(admin.getByText('Yes, cancel and rebook for a full refund.')).toBeVisible();
  await expect(admin.getByLabel('Reply as Heel support')).toHaveValue('');

  await owner.reload();
  await expect(owner.getByText('Heel replied')).toBeVisible();
  await expect(owner.getByText('Yes, cancel and rebook for a full refund.')).toBeVisible();
  await owner.getByRole('button', { name: 'Mark as solved' }).click();
  await expect(owner.getByText('This request is closed.')).toBeVisible();

  await owner.close();
  await admin.close();
});
