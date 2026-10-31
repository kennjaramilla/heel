import { describe, expect, it } from 'vitest';
import { payoutDueAt, trainingPlanInput } from './completion';

describe('trainingPlanInput', () => {
  it('drops empty steps and needs at least one', () => {
    const parsed = trainingPlanInput.parse({
      summary: 'Mochi did great once we slowed the walk down.',
      steps: ['Two 5-minute sessions a day', '', '  '],
    });
    expect(parsed.steps).toEqual(['Two 5-minute sessions a day']);
    expect(
      trainingPlanInput.safeParse({ summary: 'Mochi did great once we slowed down.', steps: [''] })
        .success,
    ).toBe(false);
  });

  it('needs a real summary', () => {
    expect(trainingPlanInput.safeParse({ summary: 'ok', steps: ['x'] }).success).toBe(false);
  });
});

describe('payoutDueAt', () => {
  it('is 24 hours after completion', () => {
    expect(payoutDueAt(new Date('2026-11-02T16:00:00Z')).toISOString()).toBe(
      '2026-11-03T16:00:00.000Z',
    );
  });
});
