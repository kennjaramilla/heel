import type { SupportTicketInput } from '@heel/core';
import type { Db } from '@heel/db';
import { schema } from '@heel/db';
import type { SupportStatus } from '@heel/db/schema';
import { and, asc, desc, eq, ne, or } from 'drizzle-orm';
import { ADMIN_PAGE_SIZE } from './admin';
import { recordAudit } from './audit';
import { notifySupportReply } from './notifications';

const { supportTicket, supportMessage, booking, user } = schema;

export type CreateTicketResult =
  { ok: true; id: string } | { ok: false; error: 'booking-not-found' };

export async function createTicket(
  db: Db,
  userId: string,
  input: SupportTicketInput,
): Promise<CreateTicketResult> {
  if (input.bookingId) {
    const [mine] = await db
      .select({ id: booking.id })
      .from(booking)
      .where(
        and(
          eq(booking.id, input.bookingId),
          or(eq(booking.ownerId, userId), eq(booking.trainerId, userId)),
        ),
      );
    if (!mine) return { ok: false, error: 'booking-not-found' };
  }
  const id = crypto.randomUUID();
  await db.transaction(async (tx) => {
    await tx
      .insert(supportTicket)
      .values({ id, userId, bookingId: input.bookingId ?? null, subject: input.subject });
    await tx
      .insert(supportMessage)
      .values({ id: crypto.randomUUID(), ticketId: id, authorId: userId, body: input.message });
  });
  return { ok: true, id };
}

export async function listTicketsForUser(db: Db, userId: string) {
  return db
    .select()
    .from(supportTicket)
    .where(eq(supportTicket.userId, userId))
    .orderBy(desc(supportTicket.updatedAt));
}

/** Admins see every ticket; everyone else only their own. */
export async function getTicket(db: Db, viewer: { id: string; role: string }, ticketId: string) {
  const [row] = await db
    .select({
      ticket: supportTicket,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
    })
    .from(supportTicket)
    .innerJoin(user, eq(user.id, supportTicket.userId))
    .where(
      viewer.role === 'admin'
        ? eq(supportTicket.id, ticketId)
        : and(eq(supportTicket.id, ticketId), eq(supportTicket.userId, viewer.id)),
    );
  if (!row) return null;
  const messages = await db
    .select({ message: supportMessage, authorName: user.name })
    .from(supportMessage)
    .leftJoin(user, eq(user.id, supportMessage.authorId))
    .where(eq(supportMessage.ticketId, ticketId))
    .orderBy(asc(supportMessage.createdAt));
  return { ...row, messages };
}

export type ReplyResult = { ok: true } | { ok: false; error: 'not-found' | 'closed' };

/** A staff reply marks the ticket answered; a reply from the person reopens it. */
export async function replyToTicket(
  db: Db,
  author: { id: string; role: string },
  ticketId: string,
  body: string,
): Promise<ReplyResult> {
  const fromStaff = author.role === 'admin';
  const ticket = await getTicket(db, author, ticketId);
  if (!ticket) return { ok: false, error: 'not-found' };
  const now = new Date();
  const messageId = crypto.randomUUID();
  const updated = await db.transaction(async (tx) => {
    const [row] = await tx
      .update(supportTicket)
      .set({ status: fromStaff ? 'answered' : 'open', updatedAt: now })
      .where(and(eq(supportTicket.id, ticketId), ne(supportTicket.status, 'closed')))
      .returning({ id: supportTicket.id });
    if (!row) return false;
    await tx.insert(supportMessage).values({
      id: messageId,
      ticketId,
      authorId: author.id,
      fromStaff,
      body,
      createdAt: now,
    });
    return true;
  });
  if (!updated) return { ok: false, error: 'closed' };
  if (fromStaff) {
    await recordAudit(db, {
      actorId: author.id,
      action: 'support.replied',
      targetType: 'support_ticket',
      targetId: ticketId,
    });
    await notifySupportReply(db, ticketId, messageId);
  }
  return { ok: true };
}

export async function closeTicket(db: Db, actor: { id: string; role: string }, ticketId: string) {
  const ticket = await getTicket(db, actor, ticketId);
  if (!ticket) return false;
  const [row] = await db
    .update(supportTicket)
    .set({ status: 'closed', updatedAt: new Date() })
    .where(and(eq(supportTicket.id, ticketId), ne(supportTicket.status, 'closed')))
    .returning({ id: supportTicket.id });
  if (row && actor.role === 'admin') {
    await recordAudit(db, {
      actorId: actor.id,
      action: 'support.closed',
      targetType: 'support_ticket',
      targetId: ticketId,
    });
  }
  return Boolean(row);
}

export async function listAllTickets(db: Db, opts: { status?: SupportStatus; page?: number }) {
  const page = Math.max(1, opts.page ?? 1);
  return db
    .select({ ticket: supportTicket, userName: user.name, userRole: user.role })
    .from(supportTicket)
    .innerJoin(user, eq(user.id, supportTicket.userId))
    .where(opts.status ? eq(supportTicket.status, opts.status) : undefined)
    .orderBy(desc(supportTicket.updatedAt))
    .limit(ADMIN_PAGE_SIZE)
    .offset((page - 1) * ADMIN_PAGE_SIZE);
}
