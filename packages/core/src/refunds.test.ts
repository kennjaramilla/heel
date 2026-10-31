import { describe, expect, it } from 'vitest';
import { refundFor } from './refunds';

const startsAt = new Date('2026-11-10T15:00:00Z');
const booking = { priceCents: 4500, platformFeeCents: 675, trainerPayoutCents: 3825, startsAt };
const hoursBefore = (h: number) => new Date(startsAt.getTime() - h * 3_600_000);

describe('refundFor', () => {
  it('refunds owners in full when they cancel 24 hours or more ahead', () => {
    expect(refundFor(booking, 'owner', hoursBefore(48))).toMatchObject({
      percent: 100,
      refundCents: 4500,
    });
    expect(refundFor(booking, 'owner', hoursBefore(24))).toMatchObject({
      percent: 100,
      refundCents: 4500,
    });
  });

  it('refunds half inside 24 hours, splitting what is kept between fee and trainer', () => {
    expect(refundFor(booking, 'owner', hoursBefore(23.99))).toEqual({
      allowed: true,
      percent: 50,
      refundCents: 2250,
      platformKeepsCents: 338,
      trainerKeepsCents: 1912,
    });
  });

  it('always refunds in full when the trainer or Heel cancels', () => {
    expect(refundFor(booking, 'trainer', hoursBefore(1))).toMatchObject({
      percent: 100,
      trainerKeepsCents: 0,
    });
    expect(refundFor(booking, 'admin', hoursBefore(1))).toMatchObject({ percent: 100 });
  });

  it('does not allow cancelling once the consult has started', () => {
    expect(refundFor(booking, 'owner', startsAt)).toEqual({
      allowed: false,
      reason: 'already-started',
    });
    expect(refundFor(booking, 'trainer', new Date(startsAt.getTime() + 60_000)).allowed).toBe(
      false,
    );
  });

  it('never loses a cent on odd prices', () => {
    const odd = { priceCents: 3333, platformFeeCents: 500, trainerPayoutCents: 2833, startsAt };
    const r = refundFor(odd, 'owner', hoursBefore(2));
    if (!r.allowed) throw new Error('should be allowed');
    expect(r.refundCents + r.platformKeepsCents + r.trainerKeepsCents).toBe(3333);
  });
});
