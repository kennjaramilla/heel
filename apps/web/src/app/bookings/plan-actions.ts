'use server';

import { trainingPlanInput } from '@heel/core';
import { redirect } from 'next/navigation';
import { getDb, requireUser } from '@/lib/auth/server';
import { saveTrainingPlan } from '@/server/completion';

export type PlanState = { message?: string };

const errors = {
  'not-found': 'That booking could not be found.',
  'not-finished': 'You can write the plan once the consult has ended.',
  'not-completable': 'This booking was cancelled.',
} as const;

export async function savePlanAction(_prev: PlanState, form: FormData): Promise<PlanState> {
  const trainer = await requireUser(['trainer']);
  const bookingId = String(form.get('bookingId') ?? '');
  const parsed = trainingPlanInput.safeParse({
    summary: form.get('summary'),
    steps: form.getAll('step'),
  });
  if (!parsed.success) return { message: parsed.error.issues[0]?.message ?? 'Check the plan.' };
  const result = await saveTrainingPlan(getDb(), trainer.id, bookingId, parsed.data);
  if (!result.ok) return { message: errors[result.error] };
  redirect(`/bookings/${bookingId}`);
}
