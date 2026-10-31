import { AUTO_COMPLETE_HOURS, payoutDueAt, type TrainingPlanInput } from '@heel/core';
import type { Db } from '@heel/db';
import { schema } from '@heel/db';
import { and, eq, gt, inArray, lte, sql } from 'drizzle-orm';
import type { Booking } from './bookings';

const { booking, trainingPlan } = schema;

export type PlanResult =
  { ok: true } | { ok: false; error: 'not-found' | 'not-finished' | 'not-completable' };

/**
 * The trainer writes the pet's training plan after the consult. Saving the first plan completes the
 * booking and schedules the trainer's payout; later saves just edit the plan.
 */
export async function saveTrainingPlan(
  db: Db,
  trainerId: string,
  bookingId: string,
  input: TrainingPlanInput,
  now = new Date(),
): Promise<PlanResult> {
  const [current] = await db
    .select()
    .from(booking)
    .where(and(eq(booking.id, bookingId), eq(booking.trainerId, trainerId)));
  if (!current) return { ok: false, error: 'not-found' };
  if (current.status !== 'confirmed' && current.status !== 'completed')
    return { ok: false, error: 'not-completable' };
  if (current.endsAt > now) return { ok: false, error: 'not-finished' };

  await db.transaction(async (tx) => {
    await tx
      .insert(trainingPlan)
      .values({ bookingId, ...input })
      .onConflictDoUpdate({ target: trainingPlan.bookingId, set: input });
    if (current.status === 'confirmed') {
      await tx
        .update(booking)
        .set({
          status: 'completed',
          completedAt: now,
          payoutStatus: 'pending',
          payoutDueAt: payoutDueAt(now),
        })
        .where(and(eq(booking.id, bookingId), eq(booking.status, 'confirmed')));
    }
  });
  return { ok: true };
}

export async function getTrainingPlan(db: Db, bookingId: string) {
  const [plan] = await db.select().from(trainingPlan).where(eq(trainingPlan.bookingId, bookingId));
  return plan ?? null;
}

/** Consults that ended long ago without a plan are completed anyway, so trainers still get paid. */
export async function autoCompleteConsults(db: Db, now = new Date()) {
  const cutoff = new Date(now.getTime() - AUTO_COMPLETE_HOURS * 3_600_000);
  const rows = await db
    .update(booking)
    .set({ status: 'completed', completedAt: now, payoutStatus: 'pending', payoutDueAt: now })
    .where(and(eq(booking.status, 'confirmed'), lte(booking.endsAt, cutoff)))
    .returning({ id: booking.id });
  return rows.length;
}

/**
 * Pays every payout that's due. Each one is marked paid with a conditional update after the
 * provider call; the provider uses the booking id as an idempotency key, so a retry never pays twice.
 */
export async function releaseDuePayouts(
  db: Db,
  payout: (booking: Booking) => Promise<string>,
  now = new Date(),
) {
  const due = await db
    .select()
    .from(booking)
    .where(
      and(
        eq(booking.payoutStatus, 'pending'),
        lte(booking.payoutDueAt, now),
        gt(booking.trainerPayoutCents, 0),
        inArray(booking.status, ['completed', 'cancelled']),
      ),
    );
  const paid: string[] = [];
  for (const b of due) {
    const payoutRef = await payout(b);
    const rows = await db
      .update(booking)
      .set({ payoutStatus: 'paid', payoutRef })
      .where(and(eq(booking.id, b.id), eq(booking.payoutStatus, 'pending')))
      .returning({ id: booking.id });
    if (rows.length) paid.push(b.id);
  }
  return paid;
}

export async function trainerEarnings(db: Db, trainerId: string) {
  const [row] = await db
    .select({
      pending: sql<number>`coalesce(sum(${booking.trainerPayoutCents}) filter (where ${booking.payoutStatus} = 'pending'), 0)::int`,
      paid: sql<number>`coalesce(sum(${booking.trainerPayoutCents}) filter (where ${booking.payoutStatus} = 'paid'), 0)::int`,
      upcoming: sql<number>`coalesce(sum(${booking.trainerPayoutCents}) filter (where ${booking.status} = 'confirmed'), 0)::int`,
    })
    .from(booking)
    .where(
      and(
        eq(booking.trainerId, trainerId),
        inArray(booking.status, ['confirmed', 'completed', 'cancelled']),
      ),
    );
  return row ?? { pending: 0, paid: 0, upcoming: 0 };
}
