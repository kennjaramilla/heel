import type { TrainerProfileInput } from '@heel/core';
import { schema } from '@heel/db';
import { createTestDb } from '@heel/db/testing';
import { describe, expect, it } from 'vitest';
import { saveAvailability } from './availability';
import { confirmBooking, createHold, expireStaleHolds, listBookings, openSlots } from './bookings';
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
  price30Cents: 2500,
  price60Cents: 4500,
  published: true,
};

// Sunday 1 Nov 2026, 06:00 UTC. Monday 2 Nov 9:00 AM in Chicago (CST, UTC-6) is 15:00 UTC.
const now = new Date('2026-11-01T06:00:00Z');
const mondayNine = '2026-11-02T15:00:00.000Z';

async function setup() {
  const db = await createTestDb();
  await db.insert(schema.user).values([
    { id: 'sam', name: 'Sam', email: 'sam@example.com', role: 'trainer' },
    { id: 'ana', name: 'Ana', email: 'ana@example.com', role: 'trainer' },
    { id: 'olive', name: 'Olive', email: 'olive@example.com' },
    { id: 'omar', name: 'Omar', email: 'omar@example.com' },
  ]);
  for (const [id, name] of [
    ['sam', 'Sam'],
    ['ana', 'Ana'],
  ] as const) {
    await saveTrainerProfile(db, { id, name }, profile);
    await saveAvailability(db, id, {
      rules: [{ weekday: 1, startMinute: 540, endMinute: 1020 }],
      blockedDates: [],
    });
  }
  const olivesPet = await createPet(db, 'olive', {
    name: 'Mochi',
    species: 'dog',
    breed: '',
    concerns: [],
    notes: '',
  });
  const omarsPet = await createPet(db, 'omar', {
    name: 'Rex',
    species: 'dog',
    breed: '',
    concerns: [],
    notes: '',
  });
  return { db, olivesPet, omarsPet };
}

const request = (petId: string, overrides = {}) => ({
  trainerSlug: 'sam',
  startsAt: mondayNine,
  lengthMinutes: 60 as const,
  petId,
  note: '',
  ...overrides,
});

describe('createHold', () => {
  it('holds an offered slot for 10 minutes with the fee split', async () => {
    const { db, olivesPet } = await setup();
    const result = await createHold(db, 'olive', request(olivesPet.id), now);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.booking).toMatchObject({
      status: 'held',
      petName: 'Mochi',
      priceCents: 4500,
      platformFeeCents: 675,
      trainerPayoutCents: 3825,
    });
    expect(result.booking.holdExpiresAt?.toISOString()).toBe('2026-11-01T06:10:00.000Z');
  });

  it('rejects times the trainer does not offer and pets that are not yours', async () => {
    const { db, olivesPet, omarsPet } = await setup();
    expect(
      await createHold(
        db,
        'olive',
        request(olivesPet.id, { startsAt: '2026-11-02T03:00:00.000Z' }),
        now,
      ),
    ).toEqual({
      ok: false,
      error: 'slot-unavailable',
    });
    expect(await createHold(db, 'olive', request(omarsPet.id), now)).toEqual({
      ok: false,
      error: 'pet-not-found',
    });
  });

  it('hides held time from other owners and frees it when the hold expires', async () => {
    const { db, olivesPet, omarsPet } = await setup();
    await createHold(db, 'olive', request(olivesPet.id), now);

    const slots = await openSlots(db, { userId: 'sam', timezone: 'America/Chicago' }, 60, now, 2);
    expect(slots.map((s) => s.toISOString())).not.toContain(mondayNine);
    expect(await createHold(db, 'omar', request(omarsPet.id), now)).toEqual({
      ok: false,
      error: 'slot-unavailable',
    });

    const later = new Date(now.getTime() + 11 * 60_000);
    expect((await createHold(db, 'omar', request(omarsPet.id), later)).ok).toBe(true);
  });

  it('lets only one of two owners win the same slot at the same moment', async () => {
    const { db, olivesPet, omarsPet } = await setup();
    const results = await Promise.all([
      createHold(db, 'olive', request(olivesPet.id), now),
      createHold(db, 'omar', request(omarsPet.id), now),
    ]);
    expect(results.filter((r) => r.ok)).toHaveLength(1);
  });

  it("uses the database's rule to stop an owner booking two trainers at once", async () => {
    const { db, olivesPet } = await setup();
    expect((await createHold(db, 'olive', request(olivesPet.id), now)).ok).toBe(true);
    expect(
      await createHold(db, 'olive', request(olivesPet.id, { trainerSlug: 'ana' }), now),
    ).toEqual({
      ok: false,
      error: 'slot-taken',
    });
  });
});

describe('confirmBooking', () => {
  it('confirms a live hold once, for its owner only', async () => {
    const { db, olivesPet } = await setup();
    const hold = await createHold(db, 'olive', request(olivesPet.id), now);
    if (!hold.ok) throw new Error('hold failed');
    const pay = { bookingId: hold.booking.id, provider: 'demo', paymentRef: 'demo_1' };

    expect(await confirmBooking(db, { ...pay, ownerId: 'omar' }, now)).toBeNull();
    expect((await confirmBooking(db, { ...pay, ownerId: 'olive' }, now))?.status).toBe('confirmed');
    expect(await confirmBooking(db, { ...pay, ownerId: 'olive' }, now)).toBeNull();
  });

  it('refuses to confirm an expired hold', async () => {
    const { db, olivesPet } = await setup();
    const hold = await createHold(db, 'olive', request(olivesPet.id), now);
    if (!hold.ok) throw new Error('hold failed');
    const later = new Date(now.getTime() + 11 * 60_000);
    await expireStaleHolds(db, later);
    expect(
      await confirmBooking(
        db,
        { bookingId: hold.booking.id, ownerId: 'olive', provider: 'demo', paymentRef: 'x' },
        later,
      ),
    ).toBeNull();
  });
});

describe('listBookings', () => {
  it('shows confirmed consults to both sides and live holds only to the owner', async () => {
    const { db, olivesPet } = await setup();
    const hold = await createHold(db, 'olive', request(olivesPet.id), now);
    if (!hold.ok) throw new Error('hold failed');

    expect((await listBookings(db, 'olive', 'owner', now)).upcoming).toHaveLength(1);
    expect((await listBookings(db, 'sam', 'trainer', now)).upcoming).toHaveLength(0);

    await confirmBooking(
      db,
      { bookingId: hold.booking.id, ownerId: 'olive', provider: 'demo', paymentRef: 'x' },
      now,
    );
    const trainerView = await listBookings(db, 'sam', 'trainer', now);
    expect(trainerView.upcoming.map((b) => [b.ownerName, b.petName])).toEqual([['Olive', 'Mochi']]);
  });
});
