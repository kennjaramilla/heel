import { schema } from '@heel/db';
import { createTestDb } from '@heel/db/testing';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { createAuth } from '@/lib/auth/config';
import { adminOverview, listUsers, setSuspended } from './admin';
import { listAudit } from './audit';

async function setup() {
  const db = await createTestDb();
  const auth = createAuth(db);
  await auth.api.signUpEmail({
    body: { name: 'Olive Owner', email: 'olive@example.com', password: 'correct-horse' },
  });
  await auth.api.signUpEmail({
    body: {
      name: 'Sam Trainer',
      email: 'sam@example.com',
      password: 'correct-horse',
      role: 'trainer',
    },
  });
  await db
    .insert(schema.user)
    .values({ id: 'admin1', name: 'Ada Admin', email: 'ada@example.com', role: 'admin' });
  const [olive] = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.email, 'olive@example.com'));
  return { db, auth, oliveId: olive!.id };
}

describe('suspending users', () => {
  it('signs them out, blocks sign-in, and records who did it', async () => {
    const { db, auth, oliveId } = await setup();
    expect(
      (await db.select().from(schema.session).where(eq(schema.session.userId, oliveId))).length,
    ).toBe(1);

    expect(await setSuspended(db, 'admin1', oliveId, true, 'Spam bookings')).toEqual({ ok: true });
    expect(
      await db.select().from(schema.session).where(eq(schema.session.userId, oliveId)),
    ).toEqual([]);
    await expect(
      auth.api.signInEmail({ body: { email: 'olive@example.com', password: 'correct-horse' } }),
    ).rejects.toThrow(/suspended/);

    const [event] = await listAudit(db);
    expect(event?.event).toMatchObject({
      action: 'user.suspended',
      actorId: 'admin1',
      targetId: oliveId,
    });
    expect(event?.actorName).toBe('Ada Admin');

    await setSuspended(db, 'admin1', oliveId, false);
    await expect(
      auth.api.signInEmail({ body: { email: 'olive@example.com', password: 'correct-horse' } }),
    ).resolves.toBeTruthy();
  });

  it('never suspends admins or yourself', async () => {
    const { db } = await setup();
    expect(await setSuspended(db, 'admin1', 'admin1', true)).toEqual({
      ok: false,
      error: 'not-allowed',
    });
    expect(await setSuspended(db, 'admin1', 'nobody', true)).toEqual({
      ok: false,
      error: 'not-found',
    });
  });
});

describe('admin reads', () => {
  it('counts users by role and searches by name or email', async () => {
    const { db } = await setup();
    const overview = await adminOverview(db);
    expect(overview.users).toEqual({ owner: 1, trainer: 1, admin: 1 });
    expect((await listUsers(db, { q: 'sam' })).map((u) => u.email)).toEqual(['sam@example.com']);
    expect((await listUsers(db, { role: 'owner' })).map((u) => u.name)).toEqual(['Olive Owner']);
  });
});
