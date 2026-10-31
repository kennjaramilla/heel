import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { user } from './schema';
import { createTestDb } from './testing';

describe('schema', () => {
  it('applies migrations and defaults new users to the owner role', async () => {
    const db = await createTestDb();
    await db.insert(user).values({ id: 'u1', name: 'Kim', email: 'kim@example.com' });
    const [row] = await db.select().from(user).where(eq(user.id, 'u1'));
    expect(row?.role).toBe('owner');
    expect(row?.emailVerified).toBe(false);
  });

  it('rejects roles outside the enum', async () => {
    const db = await createTestDb();
    await expect(
      db.insert(user).values({
        id: 'u2',
        name: 'X',
        email: 'x@example.com',
        role: 'superuser' as 'owner',
      }),
    ).rejects.toThrow();
  });

  it('keeps emails unique', async () => {
    const db = await createTestDb();
    await db.insert(user).values({ id: 'a', name: 'A', email: 'same@example.com' });
    await expect(
      db.insert(user).values({ id: 'b', name: 'B', email: 'same@example.com' }),
    ).rejects.toThrow();
  });
});
