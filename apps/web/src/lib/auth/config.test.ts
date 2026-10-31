import { schema } from '@heel/db';
import { createTestDb } from '@heel/db/testing';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { createAuth } from './config';

async function setup() {
  const db = await createTestDb();
  return { db, auth: createAuth(db) };
}

async function roleOf(db: Awaited<ReturnType<typeof setup>>['db'], email: string) {
  const [row] = await db.select().from(schema.user).where(eq(schema.user.email, email));
  return row?.role;
}

describe('sign-up roles', () => {
  it('defaults to pet owner', async () => {
    const { db, auth } = await setup();
    await auth.api.signUpEmail({
      body: { name: 'Kim', email: 'kim@example.com', password: 'correct-horse' },
    });
    expect(await roleOf(db, 'kim@example.com')).toBe('owner');
  });

  it('lets people sign up as a trainer', async () => {
    const { db, auth } = await setup();
    await auth.api.signUpEmail({
      body: { name: 'Sam', email: 'sam@example.com', password: 'correct-horse', role: 'trainer' },
    });
    expect(await roleOf(db, 'sam@example.com')).toBe('trainer');
  });

  it('never lets anyone sign up as an admin', async () => {
    const { db, auth } = await setup();
    await auth.api.signUpEmail({
      body: { name: 'Eve', email: 'eve@example.com', password: 'correct-horse', role: 'admin' },
    });
    expect(await roleOf(db, 'eve@example.com')).toBe('owner');
  });
});

describe('sign-in', () => {
  it('rejects a wrong password', async () => {
    const { auth } = await setup();
    await auth.api.signUpEmail({
      body: { name: 'Kim', email: 'kim@example.com', password: 'correct-horse' },
    });
    await expect(
      auth.api.signInEmail({ body: { email: 'kim@example.com', password: 'wrong-password' } }),
    ).rejects.toThrow();
  });
});
