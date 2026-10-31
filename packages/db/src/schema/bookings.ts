import { sql } from 'drizzle-orm';
import { check, index, integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './auth';
import { pet } from './pets';

export const bookingStatus = pgEnum('booking_status', [
  'held', // slot reserved while the owner pays; expires after a few minutes
  'confirmed',
  'completed',
  'cancelled',
  'expired',
]);
export type BookingStatus = (typeof bookingStatus.enumValues)[number];

export const booking = pgTable(
  'booking',
  {
    id: text('id').primaryKey(),
    trainerId: text('trainer_id')
      .notNull()
      .references(() => user.id, { onDelete: 'restrict' }),
    ownerId: text('owner_id')
      .notNull()
      .references(() => user.id, { onDelete: 'restrict' }),
    petId: text('pet_id').references(() => pet.id, { onDelete: 'set null' }),
    petName: text('pet_name').notNull(), // kept even if the pet is later removed
    startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
    endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
    lengthMinutes: integer('length_minutes').notNull(),
    status: bookingStatus('status').notNull().default('held'),
    holdExpiresAt: timestamp('hold_expires_at', { withTimezone: true }),
    priceCents: integer('price_cents').notNull(),
    platformFeeCents: integer('platform_fee_cents').notNull(),
    trainerPayoutCents: integer('trainer_payout_cents').notNull(),
    paymentProvider: text('payment_provider'),
    paymentRef: text('payment_ref'),
    ownerNote: text('owner_note').notNull().default(''),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index('booking_trainer_starts_idx').on(t.trainerId, t.startsAt),
    index('booking_owner_starts_idx').on(t.ownerId, t.startsAt),
    check('booking_times', sql`${t.endsAt} > ${t.startsAt}`),
    check('booking_money', sql`${t.platformFeeCents} + ${t.trainerPayoutCents} = ${t.priceCents}`),
    // No-overlap rules are exclusion constraints, added in a hand-written migration (0005).
  ],
);
