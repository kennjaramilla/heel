import type { TrainerProfileInput } from '@heel/core';
import { schema } from '@heel/db';
import { createTestDb } from '@heel/db/testing';
import { describe, expect, it } from 'vitest';
import { createAuth } from '@/lib/auth/config';
import { listAudit } from './audit';
import { saveAvailability } from './availability';
import { createHold } from './bookings';
import { createPet } from './pets';
import {
  closeTicket,
  createTicket,
  getTicket,
  listAllTickets,
  listTicketsForUser,
  replyToTicket,
} from './support';
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

async function setup() {
  const db = await createTestDb();
  const auth = createAuth(db);
  for (const [name, role] of [
    ['Olive', 'owner'],
    ['Pat', 'owner'],
    ['Sam', 'trainer'],
  ] as const) {
    await auth.api.signUpEmail({
      body: { name, email: `${name.toLowerCase()}@example.com`, password: 'correct-horse', role },
    });
  }
  await db
    .insert(schema.user)
    .values({ id: 'admin1', name: 'Ada Admin', email: 'ada@example.com', role: 'admin' });
  const ids = Object.fromEntries((await db.select().from(schema.user)).map((u) => [u.name, u.id]));
  return {
    db,
    olive: { id: ids.Olive!, role: 'owner' },
    pat: { id: ids.Pat!, role: 'owner' },
    sam: { id: ids.Sam!, role: 'trainer' },
    admin: { id: 'admin1', role: 'admin' },
  };
}

const ticket = { subject: 'Charged twice', message: 'I see two charges for one consult.' };

describe('support tickets', () => {
  it('runs a full conversation: ask, staff reply, follow-up, close', async () => {
    const { db, olive, admin } = await setup();
    const created = await createTicket(db, olive.id, ticket);
    if (!created.ok) throw new Error('create failed');

    expect(await replyToTicket(db, admin, created.id, 'Refunded the duplicate.')).toEqual({
      ok: true,
    });
    expect((await getTicket(db, olive, created.id))?.ticket.status).toBe('answered');

    await replyToTicket(db, olive, created.id, 'Thanks, one more question.');
    const thread = await getTicket(db, olive, created.id);
    expect(thread?.ticket.status).toBe('open');
    expect(thread?.messages.map((m) => [m.message.fromStaff, m.message.body])).toEqual([
      [false, ticket.message],
      [true, 'Refunded the duplicate.'],
      [false, 'Thanks, one more question.'],
    ]);

    expect(await closeTicket(db, admin, created.id)).toBe(true);
    expect(await replyToTicket(db, olive, created.id, 'Hello?')).toEqual({
      ok: false,
      error: 'closed',
    });
    expect((await listAudit(db)).map((e) => e.event.action)).toEqual([
      'support.closed',
      'support.replied',
    ]);
  });

  it('keeps tickets private to the person who opened them (and admins)', async () => {
    const { db, olive, pat, admin } = await setup();
    const created = await createTicket(db, olive.id, ticket);
    if (!created.ok) throw new Error('create failed');

    expect(await getTicket(db, pat, created.id)).toBeNull();
    expect(await replyToTicket(db, pat, created.id, 'Hi')).toEqual({
      ok: false,
      error: 'not-found',
    });
    expect(await closeTicket(db, pat, created.id)).toBe(false);
    expect(await listTicketsForUser(db, pat.id)).toEqual([]);
    expect(await getTicket(db, admin, created.id)).not.toBeNull();
    expect((await listAllTickets(db, { status: 'open' })).map((r) => r.ticket.id)).toEqual([
      created.id,
    ]);
  });

  it('only links bookings the person is part of', async () => {
    const { db, olive, pat, sam } = await setup();
    await saveTrainerProfile(db, { id: sam.id, name: 'Sam' }, profile);
    await saveAvailability(db, sam.id, {
      rules: [{ weekday: 1, startMinute: 540, endMinute: 1020 }],
      blockedDates: [],
    });
    const mochi = await createPet(db, olive.id, {
      name: 'Mochi',
      species: 'dog',
      breed: '',
      concerns: [],
      notes: '',
    });
    const hold = await createHold(
      db,
      olive.id,
      {
        trainerSlug: 'sam',
        startsAt: '2026-11-02T15:00:00.000Z',
        lengthMinutes: 60,
        petId: mochi.id,
        note: '',
      },
      new Date('2026-11-01T06:00:00Z'),
    );
    if (!hold.ok) throw new Error('hold failed');

    const withBooking = { ...ticket, bookingId: hold.booking.id };
    expect((await createTicket(db, olive.id, withBooking)).ok).toBe(true);
    expect((await createTicket(db, sam.id, withBooking)).ok).toBe(true);
    expect(await createTicket(db, pat.id, withBooking)).toEqual({
      ok: false,
      error: 'booking-not-found',
    });
  });
});
