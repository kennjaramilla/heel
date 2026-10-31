import { describe, expect, it } from 'vitest';
import type { BookingView } from './bookings';
import { toMobileBooking } from './mobile';

const booking = {
  id: 'b1',
  ownerId: 'owner-1',
  trainerId: 'trainer-1',
  ownerName: 'Kim',
  trainerName: 'Sam',
  trainerSlug: 'sam',
  petName: 'Mochi',
  ownerNote: 'Pulls on the leash',
  status: 'confirmed',
  startsAt: new Date('2026-11-02T15:00:00Z'),
  endsAt: new Date('2026-11-02T15:30:00Z'),
  lengthMinutes: 30,
  priceCents: 2500,
  platformFeeCents: 375,
  trainerPayoutCents: 2125,
  refundCents: 0,
  payoutStatus: 'pending',
  holdExpiresAt: null,
  paymentRef: 'demo_123',
} as unknown as BookingView;

describe('toMobileBooking', () => {
  it('shows owners the price they paid and the trainer', () => {
    const view = toMobileBooking(booking, 'owner-1');
    expect(view).toMatchObject({
      viewerRole: 'owner',
      otherPartyName: 'Sam',
      amountCents: 2500,
      payoutStatus: null,
      startsAt: '2026-11-02T15:00:00.000Z',
    });
  });

  it('shows trainers their payout and the owner', () => {
    const view = toMobileBooking(booking, 'trainer-1');
    expect(view).toMatchObject({
      viewerRole: 'trainer',
      otherPartyName: 'Kim',
      amountCents: 2125,
      payoutStatus: 'pending',
    });
  });

  it('never exposes payment references or platform fees', () => {
    const view = toMobileBooking(booking, 'owner-1') as Record<string, unknown>;
    expect(view.paymentRef).toBeUndefined();
    expect(view.platformFeeCents).toBeUndefined();
  });
});
