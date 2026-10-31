import type { BookingView } from './bookings';

type Plan = { summary: string; steps: string[] } | null;

/** What the mobile app sees of a booking: only the side of the money that belongs to the viewer. */
export function toMobileBooking(b: BookingView, viewerId: string, plan: Plan = null) {
  const isOwner = b.ownerId === viewerId;
  return {
    id: b.id,
    status: b.status,
    startsAt: b.startsAt.toISOString(),
    endsAt: b.endsAt.toISOString(),
    lengthMinutes: b.lengthMinutes,
    petName: b.petName,
    note: b.ownerNote,
    viewerRole: isOwner ? ('owner' as const) : ('trainer' as const),
    otherPartyName: isOwner ? b.trainerName : b.ownerName,
    trainerSlug: b.trainerSlug,
    amountCents: isOwner ? b.priceCents : b.trainerPayoutCents,
    refundCents: isOwner ? b.refundCents : 0,
    payoutStatus: isOwner ? null : b.payoutStatus,
    holdExpiresAt: isOwner ? (b.holdExpiresAt?.toISOString() ?? null) : null,
    plan: plan ? { summary: plan.summary, steps: plan.steps } : null,
  };
}

export type MobileBooking = ReturnType<typeof toMobileBooking>;
