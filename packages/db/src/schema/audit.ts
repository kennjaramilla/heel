import { index, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './auth';

// Append-only record of who did what. Never updated or deleted by the app.
export const auditEvent = pgTable(
  'audit_event',
  {
    id: text('id').primaryKey(),
    actorId: text('actor_id').references(() => user.id, { onDelete: 'set null' }),
    action: text('action').notNull(), // e.g. "booking.cancelled", "user.suspended"
    targetType: text('target_type').notNull(),
    targetId: text('target_id').notNull(),
    details: jsonb('details').$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('audit_event_created_idx').on(t.createdAt),
    index('audit_event_target_idx').on(t.targetType, t.targetId),
  ],
);
