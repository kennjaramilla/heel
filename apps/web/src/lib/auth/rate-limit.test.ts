import { createTestDb } from '@heel/db/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createAuth } from './config';

beforeAll(() => {
  process.env.RATE_LIMIT = 'on';
});
afterAll(() => {
  delete process.env.RATE_LIMIT;
});

const signIn = (auth: ReturnType<typeof createAuth>, ip: string) =>
  auth.handler(
    new Request('http://localhost:3000/api/auth/sign-in/email', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'http://localhost:3000',
        'x-forwarded-for': ip,
      },
      body: JSON.stringify({ email: 'nobody@example.com', password: 'wrong-password' }),
    }),
  );

describe('sign-in rate limit', () => {
  it('blocks the 6th attempt in a minute from the same address, but not other addresses', async () => {
    const auth = createAuth(await createTestDb());
    const statuses = [];
    for (let i = 0; i < 6; i++) statuses.push((await signIn(auth, '203.0.113.7')).status);
    expect(statuses.slice(0, 5).every((s) => s === 401)).toBe(true);
    expect(statuses[5]).toBe(429);
    expect((await signIn(auth, '198.51.100.9')).status).toBe(401);
  });
});
