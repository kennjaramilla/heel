import { sql } from 'drizzle-orm';
import {
  check,
  date,
  index,
  integer,
  pgTable,
  primaryKey,
  serial,
  smallint,
  text,
} from 'drizzle-orm/pg-core';
import { user } from './auth';

// Weekly hours in the trainer's own wall-clock time (their profile's time zone).
export const availabilityRule = pgTable(
  'availability_rule',
  {
    id: serial('id').primaryKey(),
    trainerId: text('trainer_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    weekday: smallint('weekday').notNull(),
    startMinute: integer('start_minute').notNull(),
    endMinute: integer('end_minute').notNull(),
  },
  (t) => [
    index('availability_rule_trainer_idx').on(t.trainerId),
    check('availability_weekday', sql`${t.weekday} between 0 and 6`),
    check(
      'availability_range',
      sql`${t.startMinute} >= 0 and ${t.endMinute} <= 1440 and ${t.endMinute} > ${t.startMinute}`,
    ),
  ],
);

// Whole days off, as dates in the trainer's time zone.
export const blockedDate = pgTable(
  'blocked_date',
  {
    trainerId: text('trainer_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
  },
  (t) => [primaryKey({ columns: [t.trainerId, t.date] })],
);
