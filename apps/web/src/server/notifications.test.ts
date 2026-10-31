import type { TrainerProfileInput } from '@heel/core';
import { schema } from '@heel/db';
import { createTestDb } from '@heel/db/testing';
import { describe, expect, it } from 'vitest';
import { createAuth } from '@/lib/auth/config';
import { saveAvailability } from './availability';
import { cancelBooking, confirmBooking, createHold } from './bookings';
import {
  listNotifications,
  markAllRead,
  notifyBookingCancelled,
  notifyBookingConfirmed,
  sendReminders,
  unreadCount,
} from './notifications';
import { createPet } from './pets';
import { createTicket, replyToTicket } from './support';
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
const now = new Date('2026-11-01T06:00:00Z');
const startsAt = new Date('2026-11-02T15:00:00.000Z');

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
  const olive = ids.Olive!;
  const sam = ids.Sam!;
  await saveTrainerProfile(db, { id: sam, name: 'Sam' }, profile);
  await saveAvailability(db, sam, {
    rules: [{ weekday: 1, startMinute: 540, endMinute: 1020 }],
    blockedDates: [],
  });
  const mochi = await createPet(db, olive, {
    name: 'Mochi',
    species: 'dog',
    breed: '',
    concerns: [],
    notes: '',
  });
  const hold = await createHold(
    db,
    olive,
    {
      trainerSlug: 'sam',
      startsAt: startsAt.toISOString(),
      lengthMinutes: 60,
      petId: mochi.id,
      note: '',
    },
    now,
  );
  if (!hold.ok) throw new Error('hold failed');
  await confirmBooking(
    db,
    { bookingId: hold.booking.id, ownerId: olive, provider: 'demo', paymentRef: 'ref' },
    now,
  );
  return { db, olive, sam, bookingId: hold.booking.id };
}

const titles = async (db: Awaited<ReturnType<typeof setup>>['db'], userId: string) =>
  (await listNotifications(db, userId)).map((n) => n.title);

describe('notifications', () => {
  it('tells the trainer about a new booking, only once', async () => {
    const { db, olive, sam, bookingId } = await setup();
    await notifyBookingConfirmed(db, bookingId);
    await notifyBookingConfirmed(db, bookingId);
    expect(await titles(db, sam)).toEqual(['New consult booked']);
    expect(await titles(db, olive)).toEqual([]);
  });

  it('tells the other person about a cancellation, with the refund', async () => {
    const { db, olive, sam, bookingId } = await setup();
    await cancelBooking(db, { bookingId, userId: sam, by: 'trainer' }, async () => 'refund', now);
    await notifyBookingCancelled(db, bookingId);
    const [n] = await listNotifications(db, olive);
    expect(n?.body).toBe("Sam cancelled Mochi's consult. $45 is on its way back to your card.");
    expect(await titles(db, sam)).toEqual([]);
  });

  it('reminds both people within 24 hours of the start, once per hourly run', async () => {
    const { db, olive, sam } = await setup();
    expect(await sendReminders(db, new Date(startsAt.getTime() - 25 * 3_600_000))).toBe(0);
    const dayBefore = new Date(startsAt.getTime() - 23 * 3_600_000);
    expect(await sendReminders(db, dayBefore)).toBe(1);
    await sendReminders(db, new Date(dayBefore.getTime() + 3_600_000));
    expect(await titles(db, olive)).toEqual(['Consult tomorrow']);
    expect(await titles(db, sam)).toEqual(['Consult tomorrow']);
  });

  it('notifies on a staff reply and tracks unread', async () => {
    const { db, olive } = await setup();
    await db
      .insert(schema.user)
      .values({ id: 'admin1', name: 'Ada', email: 'ada@example.com', role: 'admin' });
    const t = await createTicket(db, olive, {
      subject: 'Refund question',
      message: 'When does my refund arrive?',
    });
    if (!t.ok) throw new Error('ticket failed');
    await replyToTicket(db, { id: olive, role: 'owner' }, t.id, 'Any update?');
    expect(await unreadCount(db, olive)).toBe(0);
    await replyToTicket(db, { id: 'admin1', role: 'admin' }, t.id, 'Within 5 days.');
    expect(await unreadCount(db, olive)).toBe(1);
    await markAllRead(db, olive);
    expect(await unreadCount(db, olive)).toBe(0);
  });
});
