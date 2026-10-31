import {
  type BookingRequest,
  type ConsultLength,
  generateSlots,
  HOLD_MINUTES,
  type Interval,
  priceFor,
} from '@heel/core';
import type { Db } from '@heel/db';
import { schema } from '@heel/db';
import { and, asc, desc, eq, gt, gte, inArray, lt, lte, or } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { getAvailability } from './availability';
import { getPet } from './pets';
import { getPublishedTrainerBySlug } from './trainers';

const { booking } = schema;
export type Booking = typeof booking.$inferSelect;

const LIVE = ['held', 'confirmed'] as const;

/** Postgres raises 23P01 when an exclusion constraint (our no-overlap rule) is violated. */
function isOverlapError(error: unknown) {
  const e = error as { code?: string; cause?: { code?: string } };
  return e?.code === '23P01' || e?.cause?.code === '23P01';
}

/** Holds that ran out are released, so their time can be booked again. */
export async function expireStaleHolds(db: Db, now: Date) {
  await db
    .update(booking)
    .set({ status: 'expired', holdExpiresAt: null })
    .where(and(eq(booking.status, 'held'), lte(booking.holdExpiresAt, now)));
}

/** Times that already belong to someone: confirmed bookings and holds that haven't expired. */
export async function busyIntervals(db: Db, trainerId: string, now: Date): Promise<Interval[]> {
  const rows = await db
    .select({ start: booking.startsAt, end: booking.endsAt })
    .from(booking)
    .where(
      and(
        eq(booking.trainerId, trainerId),
        gt(booking.endsAt, now),
        or(
          eq(booking.status, 'confirmed'),
          and(eq(booking.status, 'held'), gt(booking.holdExpiresAt, now)),
        ),
      ),
    );
  return rows;
}

export async function openSlots(
  db: Db,
  trainer: { userId: string; timezone: string },
  lengthMinutes: ConsultLength,
  now: Date,
  days?: number,
) {
  const [availability, busy] = await Promise.all([
    getAvailability(db, trainer.userId),
    busyIntervals(db, trainer.userId, now),
  ]);
  return generateSlots({
    ...availability,
    timeZone: trainer.timezone,
    lengthMinutes,
    now,
    busy,
    days,
  });
}

export type HoldResult =
  | { ok: true; booking: Booking }
  | { ok: false; error: 'trainer-not-found' | 'pet-not-found' | 'slot-unavailable' | 'slot-taken' };

/**
 * Reserves a slot for the owner while they pay. The slot must be one the trainer actually offers;
 * the database's no-overlap rule settles races between two owners clicking at the same moment.
 */
export async function createHold(
  db: Db,
  ownerId: string,
  request: BookingRequest,
  now = new Date(),
): Promise<HoldResult> {
  const trainer = await getPublishedTrainerBySlug(db, request.trainerSlug);
  if (!trainer || trainer.userId === ownerId) return { ok: false, error: 'trainer-not-found' };

  const pet = await getPet(db, ownerId, request.petId);
  if (!pet) return { ok: false, error: 'pet-not-found' };

  await expireStaleHolds(db, now);
  const startsAt = new Date(request.startsAt);
  const slots = await openSlots(db, trainer, request.lengthMinutes, now);
  if (!slots.some((s) => s.getTime() === startsAt.getTime()))
    return { ok: false, error: 'slot-unavailable' };

  try {
    const [row] = await db
      .insert(booking)
      .values({
        id: crypto.randomUUID(),
        trainerId: trainer.userId,
        ownerId,
        petId: pet.id,
        petName: pet.name,
        startsAt,
        endsAt: new Date(startsAt.getTime() + request.lengthMinutes * 60_000),
        lengthMinutes: request.lengthMinutes,
        status: 'held',
        holdExpiresAt: new Date(now.getTime() + HOLD_MINUTES * 60_000),
        ownerNote: request.note,
        ...priceFor(trainer, request.lengthMinutes),
      })
      .returning();
    return { ok: true, booking: row! };
  } catch (error) {
    if (isOverlapError(error)) return { ok: false, error: 'slot-taken' };
    throw error;
  }
}

/**
 * Turns a held slot into a confirmed booking after payment. A single conditional UPDATE, so a hold
 * that expired a moment ago (or was already confirmed) can't be confirmed twice.
 */
export async function confirmBooking(
  db: Db,
  input: { bookingId: string; ownerId: string; provider: string; paymentRef: string },
  now = new Date(),
) {
  const [row] = await db
    .update(booking)
    .set({
      status: 'confirmed',
      holdExpiresAt: null,
      paymentProvider: input.provider,
      paymentRef: input.paymentRef,
    })
    .where(
      and(
        eq(booking.id, input.bookingId),
        eq(booking.ownerId, input.ownerId),
        eq(booking.status, 'held'),
        gt(booking.holdExpiresAt, now),
      ),
    )
    .returning();
  return row ?? null;
}

const trainerUser = alias(schema.user, 'trainer_user');
const ownerUser = alias(schema.user, 'owner_user');

export type BookingView = Booking & {
  trainerName: string;
  trainerSlug: string | null;
  ownerName: string;
};

function bookingViewQuery(db: Db) {
  return db
    .select({
      booking,
      trainerName: trainerUser.name,
      trainerSlug: schema.trainerProfile.slug,
      ownerName: ownerUser.name,
    })
    .from(booking)
    .innerJoin(trainerUser, eq(trainerUser.id, booking.trainerId))
    .innerJoin(ownerUser, eq(ownerUser.id, booking.ownerId))
    .leftJoin(schema.trainerProfile, eq(schema.trainerProfile.userId, booking.trainerId));
}

const toView = (r: {
  booking: Booking;
  trainerName: string;
  trainerSlug: string | null;
  ownerName: string;
}): BookingView => ({
  ...r.booking,
  trainerName: r.trainerName,
  trainerSlug: r.trainerSlug,
  ownerName: r.ownerName,
});

/** A booking visible to this user: they're the owner or the trainer on it. */
export async function getBookingForUser(db: Db, userId: string, bookingId: string) {
  const [row] = await bookingViewQuery(db).where(
    and(eq(booking.id, bookingId), or(eq(booking.ownerId, userId), eq(booking.trainerId, userId))),
  );
  return row ? toView(row) : null;
}

export async function listBookings(
  db: Db,
  userId: string,
  role: 'owner' | 'trainer',
  now = new Date(),
) {
  const mine = role === 'owner' ? eq(booking.ownerId, userId) : eq(booking.trainerId, userId);
  const [upcoming, past] = await Promise.all([
    bookingViewQuery(db)
      .where(and(mine, gte(booking.endsAt, now), inArray(booking.status, [...LIVE])))
      .orderBy(asc(booking.startsAt)),
    bookingViewQuery(db)
      .where(
        and(
          mine,
          inArray(booking.status, ['confirmed', 'completed', 'cancelled']),
          or(lt(booking.endsAt, now), inArray(booking.status, ['completed', 'cancelled'])),
        ),
      )
      .orderBy(desc(booking.startsAt))
      .limit(20),
  ]);
  // Owners don't need to see holds they abandoned; trainers never see holds at all.
  const visibleUpcoming = upcoming
    .map(toView)
    .filter(
      (b) =>
        b.status === 'confirmed' || (role === 'owner' && b.holdExpiresAt && b.holdExpiresAt > now),
    );
  return { upcoming: visibleUpcoming, past: past.map(toView) };
}
