import { z } from 'zod';

export const PAYOUT_HOLD_HOURS = 24; // time for the owner to raise a problem before the trainer is paid
export const AUTO_COMPLETE_HOURS = 48; // consults with no plan are completed automatically after this

export const trainingPlanInput = z.object({
  summary: z.string().trim().min(20, 'Write a short summary (20+ characters)').max(1500),
  steps: z
    .array(z.string().trim().max(200))
    .transform((steps) => steps.filter(Boolean))
    .pipe(z.array(z.string()).min(1, 'Add at least one homework step').max(8)),
});

export type TrainingPlanInput = z.infer<typeof trainingPlanInput>;

export function payoutDueAt(completedAt: Date) {
  return new Date(completedAt.getTime() + PAYOUT_HOLD_HOURS * 3_600_000);
}
