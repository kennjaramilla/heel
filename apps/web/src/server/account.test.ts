import type { TrainerProfileInput } from '@heel/core';
import { schema } from '@heel/db';
import { createTestDb } from '@heel/db/testing';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { createAuth } from '@/lib/auth/config';
import { deleteAccount, exportAccountData } from './account';
import { saveAvailability } from './availability';
import { confirmBooking, createHold } from './bookings';
import { createPet } from './pets';
import { saveTrainerProfile } from './trainers';

const profile: TrainerProfileInput = {
  headline: 'Calm walks for big, excited dogs',
  bio: 'Positive, practical training that fits your schedule and your home.',
  credentials: '',
  city: 'Austin, TX',
  timezone: 'America/Chicago',
  yearsExperience: 5,
  species: ['dog'],
  specialties: ['recall'],
  languages: ['English'],
  price30Cents: 250000,
  price60Cents: 450000,
  published: true,
};
const now = new Date('2026-11-01T06:00:00Z');

async function setup() {
  const db = await createTestDb();
  const auth = createAuth(db);
  await auth.api.signUpEmail({
    body: { name: 'Olive', email: 'olive@example.com', password: 'correct-horse' },
  });
  await auth.api.signUpEmail({
    body: { name: 'Sam', email: 'sam@example.com', password: 'correct-horse', role: 'trainer' },
  });
  const ids = Object.fromEntries((await db.select().from(schema.user)).map((u) => [u.name, u.id]));
  await saveTrainerProfile(db, { id: ids.Sam!, name: 'Sam' }, profile);
  await saveAvailability(db, ids.Sam!, {
    rules: [{ weekday: 1, startMinute: 540, endMinute: 1020 }],
    blockedDates: [],
  });
  const mochi = await createPet(db, ids.Olive!, {
    name: 'Mochi',
    species: 'dog',
    breed: '',
    concerns: [],
    notes: '',
  });
  return { db, auth, olive: ids.Olive!, sam: ids.Sam!, mochi };
}

async function book(db: Awaited<ReturnType<typeof setup>>['db'], ownerId: string, petId: string) {
  const hold = await createHold(
    db,
    ownerId,
    {
      trainerSlug: 'sam',
      startsAt: '2026-11-02T15:00:00.000Z',
      lengthMinutes: 60,
      petId,
      note: '',
    },
    now,
  );
  if (!hold.ok) throw new Error('hold failed');
  await confirmBooking(
    db,
    { bookingId: hold.booking.id, ownerId, provider: 'demo', paymentRef: 'secret_ref' },
    now,
  );
  return hold.booking.id;
}

describe('exportAccountData', () => {
  it("includes the person's own data but not payment references", async () => {
    const { db, olive, mochi } = await setup();
    await book(db, olive, mochi.id);
    const data = await exportAccountData(db, olive);
    expect(data.account?.email).toBe('olive@example.com');
    expect(data.pets.map((p) => p.name)).toEqual(['Mochi']);
    expect(data.bookings).toHaveLength(1);
    expect(JSON.stringify(data)).not.toContain('secret_ref');
  });
});

describe('deleteAccount', () => {
  it('refuses while there are upcoming bookings, for either side', async () => {
    const { db, olive, sam, mochi } = await setup();
    await book(db, olive, mochi.id);
    expect(await deleteAccount(db, olive, now)).toEqual({
      ok: false,
      error: 'has-upcoming-bookings',
    });
    expect(await deleteAccount(db, sam, now)).toEqual({
      ok: false,
      error: 'has-upcoming-bookings',
    });
  });

  it('anonymises the person, keeps bookings, and stops them signing in', async () => {
    const { db, auth, olive, mochi } = await setup();
    const bookingId = await book(db, olive, mochi.id);
    const afterConsult = new Date('2026-11-03T00:00:00Z');

    expect(await deleteAccount(db, olive, afterConsult)).toEqual({ ok: true });
    const [row] = await db.select().from(schema.user).where(eq(schema.user.id, olive));
    expect(row).toMatchObject({ name: 'Deleted user', email: `deleted+${olive}@heel.invalid` });
    expect(await db.select().from(schema.pet).where(eq(schema.pet.ownerId, olive))).toEqual([]);
    const [b] = await db.select().from(schema.booking).where(eq(schema.booking.id, bookingId));
    expect(b).toMatchObject({ petId: null, petName: 'Mochi' });
    await expect(
      auth.api.signInEmail({ body: { email: 'olive@example.com', password: 'correct-horse' } }),
    ).rejects.toThrow();
  });

  it('takes a trainer off the marketplace', async () => {
    const { db, sam } = await setup();
    expect(await deleteAccount(db, sam, now)).toEqual({ ok: true });
    expect(await db.select().from(schema.trainerProfile)).toEqual([]);
    expect(await db.select().from(schema.availabilityRule)).toEqual([]);
  });
});
