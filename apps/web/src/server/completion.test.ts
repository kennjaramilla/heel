import type { TrainerProfileInput } from '@heel/core';
import { schema } from '@heel/db';
import { createTestDb } from '@heel/db/testing';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { saveAvailability } from './availability';
import { cancelBooking, confirmBooking, createHold } from './bookings';
import {
  autoCompleteConsults,
  getTrainingPlan,
  releaseDuePayouts,
  saveTrainingPlan,
  trainerEarnings,
} from './completion';
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
const booked = new Date('2026-11-01T06:00:00Z');
const start = '2026-11-02T15:00:00.000Z'; // Mon 9 AM Chicago, ends 16:00 UTC
const afterEnd = new Date('2026-11-02T16:30:00Z');
const plan = {
  summary: 'Mochi relaxed once we shortened the leash practice.',
  steps: ['Two 5-minute sessions a day'],
};

async function confirmedConsult() {
  const db = await createTestDb();
  await db.insert(schema.user).values([
    { id: 'sam', name: 'Sam', email: 'sam@example.com', role: 'trainer' },
    { id: 'olive', name: 'Olive', email: 'olive@example.com' },
  ]);
  await saveTrainerProfile(db, { id: 'sam', name: 'Sam' }, profile);
  await saveAvailability(db, 'sam', {
    rules: [{ weekday: 1, startMinute: 540, endMinute: 1020 }],
    blockedDates: [],
  });
  const pet = await createPet(db, 'olive', {
    name: 'Mochi',
    species: 'dog',
    breed: '',
    concerns: [],
    notes: '',
  });
  const hold = await createHold(
    db,
    'olive',
    { trainerSlug: 'sam', startsAt: start, lengthMinutes: 60, petId: pet.id, note: '' },
    booked,
  );
  if (!hold.ok) throw new Error('hold failed');
  await confirmBooking(
    db,
    { bookingId: hold.booking.id, ownerId: 'olive', provider: 'demo', paymentRef: 'p' },
    booked,
  );
  const status = async () =>
    (await db.select().from(schema.booking).where(eq(schema.booking.id, hold.booking.id)))[0]!;
  return { db, id: hold.booking.id, status };
}

const fakePayout = (log: string[]) => async (b: { id: string; trainerPayoutCents: number }) => {
  log.push(`${b.id}:${b.trainerPayoutCents}`);
  return `payout_${b.id}`;
};

describe('training plans', () => {
  it('can only be written by the trainer, after the consult has ended', async () => {
    const { db, id } = await confirmedConsult();
    expect(await saveTrainingPlan(db, 'olive', id, plan, afterEnd)).toEqual({
      ok: false,
      error: 'not-found',
    });
    expect(await saveTrainingPlan(db, 'sam', id, plan, new Date('2026-11-02T15:30:00Z'))).toEqual({
      ok: false,
      error: 'not-finished',
    });
    expect(await saveTrainingPlan(db, 'sam', id, plan, afterEnd)).toEqual({ ok: true });
    expect((await getTrainingPlan(db, id))?.steps).toEqual(['Two 5-minute sessions a day']);
  });

  it('completes the booking and schedules the payout 24 hours later; edits keep that schedule', async () => {
    const { db, id, status } = await confirmedConsult();
    await saveTrainingPlan(db, 'sam', id, plan, afterEnd);
    expect(await status()).toMatchObject({ status: 'completed', payoutStatus: 'pending' });
    expect((await status()).payoutDueAt?.toISOString()).toBe('2026-11-03T16:30:00.000Z');

    await saveTrainingPlan(
      db,
      'sam',
      id,
      { ...plan, steps: ['Updated step'] },
      new Date('2026-11-03T10:00:00Z'),
    );
    expect((await status()).payoutDueAt?.toISOString()).toBe('2026-11-03T16:30:00.000Z');
    expect((await getTrainingPlan(db, id))?.steps).toEqual(['Updated step']);
  });
});

describe('payouts', () => {
  it('pays only when due, exactly once', async () => {
    const { db, id, status } = await confirmedConsult();
    await saveTrainingPlan(db, 'sam', id, plan, afterEnd);
    const log: string[] = [];

    expect(await releaseDuePayouts(db, fakePayout(log), new Date('2026-11-03T10:00:00Z'))).toBe(0);
    expect(await releaseDuePayouts(db, fakePayout(log), new Date('2026-11-03T17:00:00Z'))).toBe(1);
    expect(await releaseDuePayouts(db, fakePayout(log), new Date('2026-11-04T17:00:00Z'))).toBe(0);
    expect(log).toEqual([`${id}:3825`]);
    expect(await status()).toMatchObject({ payoutStatus: 'paid', payoutRef: `payout_${id}` });
    expect(await trainerEarnings(db, 'sam')).toEqual({ pending: 0, paid: 3825, upcoming: 0 });
  });

  it('auto-completes consults with no plan after 48 hours', async () => {
    const { db, status } = await confirmedConsult();
    expect(await autoCompleteConsults(db, new Date('2026-11-03T16:00:00Z'))).toBe(0);
    expect(await autoCompleteConsults(db, new Date('2026-11-04T16:00:00Z'))).toBe(1);
    expect(await status()).toMatchObject({ status: 'completed', payoutStatus: 'pending' });
  });

  it("pays the trainer's share of a late cancellation", async () => {
    const { db, id } = await confirmedConsult();
    const late = new Date('2026-11-02T05:00:00Z');
    await cancelBooking(db, { bookingId: id, userId: 'olive', by: 'owner' }, async () => 'r', late);
    const log: string[] = [];
    await releaseDuePayouts(db, fakePayout(log), new Date('2026-11-03T06:00:00Z'));
    expect(log).toEqual([`${id}:1912`]);
  });
});
