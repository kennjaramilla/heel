'use server';

import { availabilityInput } from '@heel/core';
import { getDb, requireUser } from '@/lib/auth/server';
import { saveAvailability } from '@/server/availability';

export type AvailabilityFormState = { status: 'idle' | 'saved' | 'error'; message?: string };

export async function saveHours(
  _prev: AvailabilityFormState,
  form: FormData,
): Promise<AvailabilityFormState> {
  const trainer = await requireUser(['trainer']);
  let raw: unknown;
  try {
    raw = JSON.parse(String(form.get('payload') ?? ''));
  } catch {
    return { status: 'error', message: 'Something went wrong. Reload and try again.' };
  }
  const parsed = availabilityInput.safeParse(raw);
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Check your hours.' };
  }
  await saveAvailability(getDb(), trainer.id, parsed.data);
  return { status: 'saved', message: 'Saved. Owners can book these hours.' };
}
