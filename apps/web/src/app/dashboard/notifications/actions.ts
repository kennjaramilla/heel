'use server';

import { revalidatePath } from 'next/cache';
import { getDb, requireUser } from '@/lib/auth/server';
import { markAllRead } from '@/server/notifications';

export async function markAllReadAction() {
  const user = await requireUser();
  await markAllRead(getDb(), user.id);
  revalidatePath('/dashboard/notifications');
}
