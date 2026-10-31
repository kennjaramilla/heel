import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { user } from './auth';

export const species = pgEnum('species', ['dog', 'cat']);

export const trainerProfile = pgTable(
  'trainer_profile',
  {
    userId: text('user_id')
      .primaryKey()
      .references(() => user.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull().unique(),
    headline: text('headline').notNull(),
    bio: text('bio').notNull(),
    credentials: text('credentials').notNull().default(''),
    city: text('city').notNull(),
    timezone: text('timezone').notNull(),
    yearsExperience: integer('years_experience').notNull().default(0),
    species: species('species').array().notNull(),
    specialties: text('specialties').array().notNull(),
    languages: text('languages').array().notNull(),
    price30Cents: integer('price_30_cents').notNull(),
    price60Cents: integer('price_60_cents').notNull(),
    published: boolean('published').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index('trainer_profile_published_idx').on(t.published),
    // The database enforces money rules too, not just the form.
    check('trainer_price_30_range', sql`${t.price30Cents} between 1000 and 50000`),
    check('trainer_price_60_range', sql`${t.price60Cents} between 1000 and 50000`),
  ],
);
