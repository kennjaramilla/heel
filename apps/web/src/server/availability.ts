import type { AvailabilityInput } from '@heel/core';
import type { Db } from '@heel/db';
import { schema } from '@heel/db';
import { asc, eq } from 'drizzle-orm';

const { availabilityRule, blockedDate } = schema;

export async function getAvailability(db: Db, trainerId: string): Promise<AvailabilityInput> {
  const [rules, blocked] = await Promise.all([
    db
      .select({
        weekday: availabilityRule.weekday,
        startMinute: availabilityRule.startMinute,
        endMinute: availabilityRule.endMinute,
      })
      .from(availabilityRule)
      .where(eq(availabilityRule.trainerId, trainerId))
      .orderBy(asc(availabilityRule.weekday), asc(availabilityRule.startMinute)),
    db
      .select({ date: blockedDate.date })
      .from(blockedDate)
      .where(eq(blockedDate.trainerId, trainerId))
      .orderBy(asc(blockedDate.date)),
  ]);
  return { rules, blockedDates: blocked.map((b) => b.date) };
}

/** Replaces the trainer's weekly hours and days off in one transaction. */
export async function saveAvailability(db: Db, trainerId: string, input: AvailabilityInput) {
  await db.transaction(async (tx) => {
    await tx.delete(availabilityRule).where(eq(availabilityRule.trainerId, trainerId));
    await tx.delete(blockedDate).where(eq(blockedDate.trainerId, trainerId));
    if (input.rules.length) {
      await tx.insert(availabilityRule).values(input.rules.map((r) => ({ ...r, trainerId })));
    }
    if (input.blockedDates.length) {
      await tx.insert(blockedDate).values(input.blockedDates.map((date) => ({ date, trainerId })));
    }
  });
}
