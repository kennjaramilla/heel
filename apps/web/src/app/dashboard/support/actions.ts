'use server';

import { supportReplyInput, supportTicketInput } from '@heel/core';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getDb, requireUser } from '@/lib/auth/server';
import { closeTicket, createTicket, replyToTicket } from '@/server/support';

export type SupportState = { message?: string; sentAt?: number };

function ticketPath(role: string, id: string) {
  return role === 'admin' ? `/admin/support/${id}` : `/dashboard/support/${id}`;
}

export async function openTicketAction(_prev: SupportState, form: FormData): Promise<SupportState> {
  const user = await requireUser(['owner', 'trainer']);
  const parsed = supportTicketInput.safeParse({
    subject: form.get('subject'),
    message: form.get('message'),
    bookingId: form.get('bookingId') ?? '',
  });
  if (!parsed.success) return { message: parsed.error.issues[0]?.message };
  const result = await createTicket(getDb(), user.id, parsed.data);
  if (!result.ok) return { message: 'That booking could not be found.' };
  redirect(`/dashboard/support/${result.id}`);
}

export async function replyAction(_prev: SupportState, form: FormData): Promise<SupportState> {
  const user = await requireUser();
  const ticketId = String(form.get('ticketId') ?? '');
  const parsed = supportReplyInput.safeParse({ body: form.get('body') });
  if (!parsed.success) return { message: parsed.error.issues[0]?.message };
  const result = await replyToTicket(getDb(), user, ticketId, parsed.data.body);
  if (!result.ok)
    return {
      message:
        result.error === 'closed'
          ? 'This request is closed. Open a new one if you still need help.'
          : 'That request could not be found.',
    };
  revalidatePath(ticketPath(user.role, ticketId));
  return { sentAt: Date.now() };
}

export async function closeTicketAction(ticketId: string) {
  const user = await requireUser();
  await closeTicket(getDb(), user, ticketId);
  redirect(ticketPath(user.role, ticketId));
}
