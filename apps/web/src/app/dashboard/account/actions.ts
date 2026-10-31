'use server';

import { schema } from '@heel/db';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuth, getDb, requireUser } from '@/lib/auth/server';
import { deleteAccount } from '@/server/account';

export type AccountState = { message?: string; ok?: boolean };

export async function updateNameAction(_prev: AccountState, form: FormData): Promise<AccountState> {
  const me = await requireUser();
  const name = String(form.get('name') ?? '').trim();
  if (name.length < 1 || name.length > 80) return { message: 'Use 1–80 characters.' };
  await getDb().update(schema.user).set({ name }).where(eq(schema.user.id, me.id));
  return { ok: true, message: 'Name updated.' };
}

export async function deleteAccountAction(
  _prev: AccountState,
  form: FormData,
): Promise<AccountState> {
  const me = await requireUser(['owner', 'trainer']);
  if (form.get('confirm') !== 'DELETE') return { message: 'Type DELETE to confirm.' };
  const result = await deleteAccount(getDb(), me.id);
  if (!result.ok) {
    return {
      message:
        result.error === 'has-upcoming-bookings'
          ? 'You have upcoming consults. Cancel them first, then delete your account.'
          : 'This account cannot be deleted here.',
    };
  }
  // Sessions are already gone; this clears the cookie in the browser too.
  await getAuth()
    .api.signOut({ headers: await headers() })
    .catch(() => undefined);
  redirect('/?deleted=1');
}
