import type { Db } from '@heel/db';
import { schema } from '@heel/db';
import type { BookingStatus, UserRole } from '@heel/db/schema';
import { and, count, desc, eq, gte, ilike, isNotNull, or, type SQL, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { recordAudit } from './audit';

const { user, session, booking } = schema;
export const ADMIN_PAGE_SIZE = 25;

export async function adminOverview(db: Db, now = new Date()) {
  const since = new Date(now.getTime() - 30 * 86_400_000);
  const [roles, statuses, [money]] = await Promise.all([
    db.select({ role: user.role, n: count() }).from(user).groupBy(user.role),
    db.select({ status: booking.status, n: count() }).from(booking).groupBy(booking.status),
    db
      .select({
        gross: sql<number>`coalesce(sum(${booking.priceCents}) filter (where ${booking.status} in ('confirmed', 'completed', 'cancelled')), 0)::int`,
        fees: sql<number>`coalesce(sum(${booking.platformFeeCents}) filter (where ${booking.status} in ('confirmed', 'completed', 'cancelled')), 0)::int`,
        refunds: sql<number>`coalesce(sum(${booking.refundCents}), 0)::int`,
        payoutsPending: sql<number>`coalesce(sum(${booking.trainerPayoutCents}) filter (where ${booking.payoutStatus} = 'pending'), 0)::int`,
        payoutsPaid: sql<number>`coalesce(sum(${booking.trainerPayoutCents}) filter (where ${booking.payoutStatus} = 'paid'), 0)::int`,
      })
      .from(booking)
      .where(gte(booking.createdAt, since)),
  ]);
  const [{ suspended } = { suspended: 0 }] = await db
    .select({ suspended: count() })
    .from(user)
    .where(isNotNull(user.suspendedAt));
  return {
    users: Object.fromEntries(roles.map((r) => [r.role, r.n])) as Partial<Record<UserRole, number>>,
    suspended,
    bookings: Object.fromEntries(statuses.map((s) => [s.status, s.n])) as Partial<
      Record<BookingStatus, number>
    >,
    money: money!,
  };
}

export async function listUsers(db: Db, opts: { q?: string; role?: UserRole; page?: number }) {
  const filters: SQL[] = [];
  if (opts.q) {
    const pattern = `%${opts.q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
    filters.push(or(ilike(user.name, pattern), ilike(user.email, pattern))!);
  }
  if (opts.role) filters.push(eq(user.role, opts.role));
  const page = Math.max(1, opts.page ?? 1);
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      suspendedAt: user.suspendedAt,
      suspendedReason: user.suspendedReason,
    })
    .from(user)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(user.createdAt))
    .limit(ADMIN_PAGE_SIZE)
    .offset((page - 1) * ADMIN_PAGE_SIZE);
}

export type SuspendResult = { ok: true } | { ok: false; error: 'not-found' | 'not-allowed' };

/** Suspending signs the person out everywhere and blocks new sign-ins. Admins can't be suspended here. */
export async function setSuspended(
  db: Db,
  actorId: string,
  userId: string,
  suspend: boolean,
  reason = '',
): Promise<SuspendResult> {
  const [target] = await db.select().from(user).where(eq(user.id, userId));
  if (!target) return { ok: false, error: 'not-found' };
  if (target.role === 'admin' || target.id === actorId) return { ok: false, error: 'not-allowed' };

  await db.transaction(async (tx) => {
    await tx
      .update(user)
      .set(
        suspend
          ? { suspendedAt: new Date(), suspendedReason: reason.trim() || null }
          : { suspendedAt: null, suspendedReason: null },
      )
      .where(eq(user.id, userId));
    if (suspend) await tx.delete(session).where(eq(session.userId, userId));
  });
  await recordAudit(db, {
    actorId,
    action: suspend ? 'user.suspended' : 'user.unsuspended',
    targetType: 'user',
    targetId: userId,
    details: suspend
      ? { reason: reason.trim() || null, email: target.email }
      : { email: target.email },
  });
  return { ok: true };
}

const trainerUser = alias(user, 'trainer_user');
const ownerUser = alias(user, 'owner_user');

export async function listAllBookings(db: Db, opts: { status?: BookingStatus; page?: number }) {
  const page = Math.max(1, opts.page ?? 1);
  return db
    .select({ booking, trainerName: trainerUser.name, ownerName: ownerUser.name })
    .from(booking)
    .innerJoin(trainerUser, eq(trainerUser.id, booking.trainerId))
    .innerJoin(ownerUser, eq(ownerUser.id, booking.ownerId))
    .where(opts.status ? eq(booking.status, opts.status) : undefined)
    .orderBy(desc(booking.startsAt))
    .limit(ADMIN_PAGE_SIZE)
    .offset((page - 1) * ADMIN_PAGE_SIZE);
}
