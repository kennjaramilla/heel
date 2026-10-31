'use server';

import { bookingRequest } from '@heel/core';
import { redirect } from 'next/navigation';
import { getDb, getSession, requireUser } from '@/lib/auth/server';
import {
  cancelBooking,
  confirmBooking,
  createHold,
  getBookingForUser,
  releaseHold,
} from '@/server/bookings';
import { recordAudit } from '@/server/audit';
import { getPaymentProvider } from '@/server/payments';

export type HoldState = { message?: string };

const holdErrors = {
  'trainer-not-found': 'This trainer is not taking bookings right now.',
  'pet-not-found': 'Pick one of your pets.',
  'slot-unavailable': 'That time was just taken. Please pick another.',
  'slot-taken':
    'That time was just taken, or you already have a consult then. Please pick another.',
  'too-many-holds': 'You have a few unpaid holds already. Pay for or release one first.',
} as const;

export async function holdSlot(_prev: HoldState, form: FormData): Promise<HoldState> {
  const trainerSlug = String(form.get('trainerSlug') ?? '');
  const session = await getSession();
  if (!session) redirect(`/sign-in?next=${encodeURIComponent(`/trainers/${trainerSlug}`)}`);
  const owner = await requireUser(['owner']);

  const parsed = bookingRequest.safeParse({
    trainerSlug,
    startsAt: form.get('startsAt'),
    lengthMinutes: form.get('lengthMinutes'),
    petId: form.get('petId'),
    note: form.get('note') ?? '',
  });
  if (!parsed.success)
    return { message: parsed.error.issues[0]?.message ?? 'Pick a time and a pet.' };

  const result = await createHold(getDb(), owner.id, parsed.data);
  if (!result.ok) return { message: holdErrors[result.error] };
  redirect(`/bookings/${result.booking.id}`);
}

export async function payForBooking(bookingId: string) {
  const owner = await requireUser(['owner']);
  const db = getDb();
  const booking = await getBookingForUser(db, owner.id, bookingId);
  if (!booking || booking.ownerId !== owner.id || booking.status !== 'held')
    redirect(`/bookings/${bookingId}`);

  const provider = getPaymentProvider();
  const checkout = await provider.startCheckout(booking);
  if (checkout.kind === 'redirect') redirect(checkout.url);

  // If the hold ran out while paying, confirmBooking returns null and the page shows "expired".
  const confirmed = await confirmBooking(db, {
    bookingId,
    ownerId: owner.id,
    provider: provider.name,
    paymentRef: checkout.paymentRef,
  });
  if (confirmed) {
    await recordAudit(db, {
      actorId: owner.id,
      action: 'booking.confirmed',
      targetType: 'booking',
      targetId: bookingId,
      details: { priceCents: confirmed.priceCents, provider: provider.name },
    });
  }
  redirect(`/bookings/${bookingId}`);
}

export type CancelState = { message?: string };

const cancelErrors = {
  'not-found': 'That booking could not be found.',
  'already-started': 'This consult has already started, so it can no longer be cancelled.',
  'not-cancellable': 'This booking is no longer active.',
} as const;

export async function cancelBookingAction(
  _prev: CancelState,
  form: FormData,
): Promise<CancelState> {
  const user = await requireUser(['owner', 'trainer']);
  const bookingId = String(form.get('bookingId') ?? '');
  const provider = getPaymentProvider();
  const db = getDb();
  const result = await cancelBooking(
    db,
    {
      bookingId,
      userId: user.id,
      by: user.role as 'owner' | 'trainer',
      reason: String(form.get('reason') ?? ''),
    },
    (booking, cents) => provider.refund(booking, cents),
  );
  if (!result.ok) return { message: cancelErrors[result.error] };
  await recordAudit(db, {
    actorId: user.id,
    action: 'booking.cancelled',
    targetType: 'booking',
    targetId: bookingId,
    details: { by: user.role, refundCents: result.booking.refundCents },
  });
  redirect(`/bookings/${bookingId}`);
}

export async function releaseHoldAction(bookingId: string) {
  const owner = await requireUser(['owner']);
  const db = getDb();
  const booking = await getBookingForUser(db, owner.id, bookingId);
  await releaseHold(db, owner.id, bookingId);
  redirect(booking?.trainerSlug ? `/trainers/${booking.trainerSlug}` : '/dashboard/bookings');
}
