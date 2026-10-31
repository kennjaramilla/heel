export const FULL_REFUND_HOURS = 24;
export const LATE_REFUND_PERCENT = 50;

export type CancelledBy = 'owner' | 'trainer' | 'admin';

export type RefundDecision =
  | { allowed: false; reason: 'already-started' }
  | {
      allowed: true;
      percent: number;
      refundCents: number;
      // Who keeps what after the refund. Fee and payout shrink in proportion, so they still add up.
      platformKeepsCents: number;
      trainerKeepsCents: number;
    };

/**
 * Cancelling more than 24 hours ahead is free; later, owners get half back. A trainer (or Heel)
 * cancelling always refunds in full. Nobody can cancel once the consult has started.
 */
export function refundFor(
  booking: {
    priceCents: number;
    platformFeeCents: number;
    trainerPayoutCents: number;
    startsAt: Date;
  },
  by: CancelledBy,
  now: Date,
): RefundDecision {
  if (now.getTime() >= booking.startsAt.getTime())
    return { allowed: false, reason: 'already-started' };

  const early = booking.startsAt.getTime() - now.getTime() >= FULL_REFUND_HOURS * 3_600_000;
  const percent = by !== 'owner' || early ? 100 : LATE_REFUND_PERCENT;
  const refundCents = Math.round((booking.priceCents * percent) / 100);
  const kept = booking.priceCents - refundCents;
  const platformKeepsCents = Math.round((booking.platformFeeCents * (100 - percent)) / 100);
  return {
    allowed: true,
    percent,
    refundCents,
    platformKeepsCents,
    trainerKeepsCents: kept - platformKeepsCents,
  };
}
