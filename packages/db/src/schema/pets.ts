import { date, index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './auth';
import { species } from './trainers';

export const pet = pgTable(
  'pet',
  {
    id: text('id').primaryKey(),
    ownerId: text('owner_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    species: species('species').notNull(),
    breed: text('breed').notNull().default(''),
    bornOn: date('born_on'),
    concerns: text('concerns').array().notNull().default([]),
    notes: text('notes').notNull().default(''),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index('pet_owner_id_idx').on(t.ownerId)],
);
