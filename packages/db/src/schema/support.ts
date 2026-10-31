import { boolean, index, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './auth';
import { booking } from './bookings';

export const supportStatus = pgEnum('support_status', ['open', 'answered', 'closed']);
export type SupportStatus = (typeof supportStatus.enumValues)[number];

export const supportTicket = pgTable(
  'support_ticket',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    bookingId: text('booking_id').references(() => booking.id, { onDelete: 'set null' }),
    subject: text('subject').notNull(),
    status: supportStatus('status').notNull().default('open'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('support_ticket_user_idx').on(t.userId),
    index('support_ticket_status_idx').on(t.status, t.updatedAt),
  ],
);

export const supportMessage = pgTable(
  'support_message',
  {
    id: text('id').primaryKey(),
    ticketId: text('ticket_id')
      .notNull()
      .references(() => supportTicket.id, { onDelete: 'cascade' }),
    authorId: text('author_id').references(() => user.id, { onDelete: 'set null' }),
    fromStaff: boolean('from_staff').notNull().default(false),
    body: text('body').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('support_message_ticket_idx').on(t.ticketId, t.createdAt)],
);
