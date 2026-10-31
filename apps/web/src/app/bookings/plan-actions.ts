'use server';

import { trainingPlanInput } from '@heel/core';
import { redirect } from 'next/navigation';
import { getDb, requireUser } from '@/lib/auth/server';
import { recordAudit } from '@/server/audit';
import { saveTrainingPlan } from '@/server/completion';
import { notifyPlanSent } from '@/server/notifications';

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
  const db = getDb();
  const result = await saveTrainingPlan(db, trainer.id, bookingId, parsed.data);
  if (!result.ok) return { message: errors[result.error] };
  await recordAudit(db, {
    actorId: trainer.id,
    action: 'plan.saved',
    targetType: 'booking',
    targetId: bookingId,
  });
  await notifyPlanSent(db, bookingId);
  redirect(`/bookings/${bookingId}`);
}
