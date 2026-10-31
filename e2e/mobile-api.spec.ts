import { expect, test } from './fixtures';

test('the mobile app signs in with its scheme and reads bookings', async ({
  playwright,
  baseURL,
}) => {
  const app = await playwright.request.newContext({ baseURL });
  expect((await app.get('/api/mobile/bookings')).status()).toBe(401);

  const signIn = await app.post('/api/auth/sign-in/email', {
    headers: { 'expo-origin': 'heel://' },
    data: { email: 'owner@heel.dev', password: 'heel-demo-2026' },
  });
  expect(signIn.ok()).toBe(true);

  const me = await (await app.get('/api/mobile/me')).json();
  expect(me).toMatchObject({ email: 'owner@heel.dev', role: 'owner' });

  const { upcoming } = await (await app.get('/api/mobile/bookings')).json();
  expect(upcoming.length).toBeGreaterThan(0);
  expect(upcoming[0]).toMatchObject({ viewerRole: 'owner' });
  expect(upcoming[0].paymentRef).toBeUndefined();

  const detail = await app.get(`/api/mobile/bookings/${upcoming[0].id}`);
  expect((await detail.json()).id).toBe(upcoming[0].id);
  expect((await app.get('/api/mobile/bookings/not-a-booking')).status()).toBe(404);
  await app.dispose();
});

test('the mobile app can not sign in from another scheme', async ({ playwright, baseURL }) => {
  const app = await playwright.request.newContext({ baseURL });
  const signIn = await app.post('/api/auth/sign-in/email', {
    headers: { origin: 'evil://' },
    data: { email: 'owner@heel.dev', password: 'heel-demo-2026' },
  });
  expect(signIn.status()).toBe(403);
  await app.dispose();
});
