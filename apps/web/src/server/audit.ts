import type { Db } from '@heel/db';
import { schema } from '@heel/db';
import { desc, eq } from 'drizzle-orm';

const { auditEvent, user } = schema;

export type AuditInput = {
  actorId: string | null; // null = the system (e.g. the payouts job)
  action: string;
  targetType: 'booking' | 'user' | 'payout';
  targetId: string;
  details?: Record<string, unknown>;
};

export async function recordAudit(db: Db, event: AuditInput) {
  await db.insert(auditEvent).values({ id: crypto.randomUUID(), details: {}, ...event });
}

export async function listAudit(db: Db, limit = 100) {
  return db
    .select({ event: auditEvent, actorName: user.name, actorEmail: user.email })
    .from(auditEvent)
    .leftJoin(user, eq(user.id, auditEvent.actorId))
    .orderBy(desc(auditEvent.createdAt))
    .limit(limit);
}
