import { formatCents } from '@heel/core';
import type { Db } from '@heel/db';
import { schema } from '@heel/db';
import { and, count, desc, eq, gt, isNull, lte } from 'drizzle-orm';
import { getBooking } from './bookings';

const { notification, booking, supportTicket } = schema;

export const REMINDER_HOURS = 24;

type NewNotification = {
  userId: string;
  title: string;
  body: string;
  href: string;
  dedupeKey: string;
};

/** Repeats of the same event (same dedupe key) are ignored. */
export async function notify(db: Db, items: NewNotification[]) {
  if (!items.length) return;
  await db
    .insert(notification)
    .values(items.map((n) => ({ id: crypto.randomUUID(), ...n })))
    .onConflictDoNothing({ target: notification.dedupeKey });
}

export async function notifyBookingConfirmed(db: Db, bookingId: string) {
  const b = await getBooking(db, bookingId);
  if (!b) return;
  await notify(db, [
    {
      userId: b.trainerId,
      title: 'New consult booked',
      body: `${b.ownerName} booked ${b.lengthMinutes} minutes for ${b.petName}.`,
      href: `/bookings/${b.id}`,
      dedupeKey: `confirmed:${b.id}`,
    },
  ]);
}

/** Tells everyone on the booking except whoever cancelled it. */
export async function notifyBookingCancelled(db: Db, bookingId: string) {
  const b = await getBooking(db, bookingId);
  if (!b || b.status !== 'cancelled') return;
  const by =
    b.cancelledBy === 'admin' ? 'Heel' : b.cancelledBy === 'owner' ? b.ownerName : b.trainerName;
  const items: NewNotification[] = [];
  if (b.cancelledBy !== 'owner') {
    items.push({
      userId: b.ownerId,
      title: 'Consult cancelled',
      body: `${by} cancelled ${b.petName}'s consult.${b.refundCents > 0 ? ` ${formatCents(b.refundCents)} is on its way back to your card.` : ''}`,
      href: `/bookings/${b.id}`,
      dedupeKey: `cancelled:${b.id}:owner`,
    });
  }
  if (b.cancelledBy !== 'trainer') {
    items.push({
      userId: b.trainerId,
      title: 'Consult cancelled',
      body: `${by} cancelled the consult for ${b.petName}.${b.trainerPayoutCents > 0 ? ` You keep ${formatCents(b.trainerPayoutCents)}.` : ''}`,
      href: `/bookings/${b.id}`,
      dedupeKey: `cancelled:${b.id}:trainer`,
    });
  }
  await notify(db, items);
}

export async function notifyPlanSent(db: Db, bookingId: string) {
  const b = await getBooking(db, bookingId);
  if (!b) return;
  await notify(db, [
    {
      userId: b.ownerId,
      title: `${b.petName}'s training plan is ready`,
      body: `${b.trainerName} sent homework from your consult.`,
      href: `/bookings/${b.id}`,
      dedupeKey: `plan:${b.id}`,
    },
  ]);
}

export async function notifyPayoutsPaid(db: Db, bookingIds: string[]) {
  for (const id of bookingIds) {
    const b = await getBooking(db, id);
    if (!b) continue;
    await notify(db, [
      {
        userId: b.trainerId,
        title: 'Payout sent',
        body: `${formatCents(b.trainerPayoutCents)} for the consult with ${b.petName}.`,
        href: `/bookings/${b.id}`,
        dedupeKey: `payout:${b.id}`,
      },
    ]);
  }
}

export async function notifySupportReply(db: Db, ticketId: string, messageId: string) {
  const [t] = await db.select().from(supportTicket).where(eq(supportTicket.id, ticketId));
  if (!t) return;
  await notify(db, [
    {
      userId: t.userId,
      title: 'Heel support replied',
      body: t.subject,
      href: `/dashboard/support/${t.id}`,
      dedupeKey: `support:${messageId}`,
    },
  ]);
}

/** Reminds both people about consults starting within the next day. Safe to run hourly. */
export async function sendReminders(db: Db, now = new Date()) {
  const until = new Date(now.getTime() + REMINDER_HOURS * 3_600_000);
  const soon = await db
    .select({ id: booking.id })
    .from(booking)
    .where(
      and(eq(booking.status, 'confirmed'), gt(booking.startsAt, now), lte(booking.startsAt, until)),
    );
  for (const { id } of soon) {
    const b = await getBooking(db, id);
    if (!b) continue;
    await notify(db, [
      {
        userId: b.ownerId,
        title: 'Consult tomorrow',
        body: `${b.petName}'s consult with ${b.trainerName} is coming up. Have treats and a leash ready.`,
        href: `/bookings/${b.id}`,
        dedupeKey: `reminder:${b.id}:owner`,
      },
      {
        userId: b.trainerId,
        title: 'Consult tomorrow',
        body: `${b.ownerName} and ${b.petName}, ${b.lengthMinutes} minutes.`,
        href: `/bookings/${b.id}`,
        dedupeKey: `reminder:${b.id}:trainer`,
      },
    ]);
  }
  return soon.length;
}

export async function listNotifications(db: Db, userId: string, limit = 50) {
  return db
    .select()
    .from(notification)
    .where(eq(notification.userId, userId))
    .orderBy(desc(notification.createdAt))
    .limit(limit);
}

export async function unreadCount(db: Db, userId: string) {
  const [row] = await db
    .select({ n: count() })
    .from(notification)
    .where(and(eq(notification.userId, userId), isNull(notification.readAt)));
  return row?.n ?? 0;
}

export async function markAllRead(db: Db, userId: string, now = new Date()) {
  await db
    .update(notification)
    .set({ readAt: now })
    .where(and(eq(notification.userId, userId), isNull(notification.readAt)));
}
