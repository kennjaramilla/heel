import type { Db } from '@heel/db';
import { schema } from '@heel/db';
import { and, eq, gt, inArray, or } from 'drizzle-orm';
import { recordAudit } from './audit';
import { getTrainingPlan } from './completion';

const { user, session, account, pet, booking, trainerProfile, availabilityRule, blockedDate } =
  schema;

/** Everything we hold about a person, as plain JSON they can download. */
export async function exportAccountData(db: Db, userId: string) {
  const [me] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(eq(user.id, userId));
  const [pets, bookings, [profile], rules] = await Promise.all([
    db.select().from(pet).where(eq(pet.ownerId, userId)),
    db
      .select()
      .from(booking)
      .where(or(eq(booking.ownerId, userId), eq(booking.trainerId, userId))),
    db.select().from(trainerProfile).where(eq(trainerProfile.userId, userId)),
    db.select().from(availabilityRule).where(eq(availabilityRule.trainerId, userId)),
  ]);
  const plans = await Promise.all(bookings.map((b) => getTrainingPlan(db, b.id)));
  return {
    exportedAt: new Date().toISOString(),
    account: me ?? null,
    pets,
    trainerProfile: profile ?? null,
    weeklyHours: rules.map(({ weekday, startMinute, endMinute }) => ({
      weekday,
      startMinute,
      endMinute,
    })),
    bookings: bookings.map(({ paymentRef, refundRef, payoutRef, ...b }) => b),
    trainingPlans: plans.filter(Boolean),
  };
}

export type DeleteResult =
  { ok: true } | { ok: false; error: 'has-upcoming-bookings' | 'not-allowed' };

/**
 * Deletes a person's account. Bookings are financial records, so they stay, but they no longer
 * point to anything personal: the user row is anonymised, logins and pets are removed, and a
 * trainer's public profile and hours are taken down.
 */
export async function deleteAccount(
  db: Db,
  userId: string,
  now = new Date(),
): Promise<DeleteResult> {
  const [me] = await db.select().from(user).where(eq(user.id, userId));
  if (!me || me.role === 'admin') return { ok: false, error: 'not-allowed' };

  const upcoming = await db
    .select({ id: booking.id })
    .from(booking)
    .where(
      and(
        or(eq(booking.ownerId, userId), eq(booking.trainerId, userId)),
        inArray(booking.status, ['held', 'confirmed']),
        gt(booking.endsAt, now),
      ),
    );
  if (upcoming.length) return { ok: false, error: 'has-upcoming-bookings' };

  await db.transaction(async (tx) => {
    await tx.delete(session).where(eq(session.userId, userId));
    await tx.delete(account).where(eq(account.userId, userId));
    await tx.delete(pet).where(eq(pet.ownerId, userId));
    await tx.delete(availabilityRule).where(eq(availabilityRule.trainerId, userId));
    await tx.delete(blockedDate).where(eq(blockedDate.trainerId, userId));
    await tx.delete(trainerProfile).where(eq(trainerProfile.userId, userId));
    await tx
      .update(user)
      .set({
        name: 'Deleted user',
        email: `deleted+${userId}@heel.invalid`,
        image: null,
        emailVerified: false,
      })
      .where(eq(user.id, userId));
  });
  await recordAudit(db, {
    actorId: null,
    action: 'user.deleted',
    targetType: 'user',
    targetId: userId,
  });
  return { ok: true };
}
