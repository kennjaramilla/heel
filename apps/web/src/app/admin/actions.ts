'use server';

import { revalidatePath } from 'next/cache';
import { getDb, requireUser } from '@/lib/auth/server';
import { setSuspended } from '@/server/admin';
import { recordAudit } from '@/server/audit';
import { cancelBooking } from '@/server/bookings';
import { notifyBookingCancelled } from '@/server/notifications';
import { getPaymentProvider } from '@/server/payments';

export type AdminActionState = { message?: string; ok?: boolean };

export async function suspendUserAction(
  _prev: AdminActionState,
  form: FormData,
): Promise<AdminActionState> {
  const admin = await requireUser(['admin']);
  const userId = String(form.get('userId') ?? '');
  const suspend = form.get('suspend') === 'true';
  const result = await setSuspended(
    getDb(),
    admin.id,
    userId,
    suspend,
    String(form.get('reason') ?? ''),
  );
  if (!result.ok)
    return {
      message: result.error === 'not-allowed' ? "Admins can't be suspended." : 'User not found.',
    };
  revalidatePath('/admin/users');
  return { ok: true };
}

export async function adminCancelAction(
  _prev: AdminActionState,
  form: FormData,
): Promise<AdminActionState> {
  const admin = await requireUser(['admin']);
  const bookingId = String(form.get('bookingId') ?? '');
  const db = getDb();
  const provider = getPaymentProvider();
  const result = await cancelBooking(
    db,
    {
      bookingId,
      userId: admin.id,
      by: 'admin',
      reason: String(form.get('reason') ?? '') || 'Cancelled by Heel support',
    },
    (booking, cents) => provider.refund(booking, cents),
  );
  if (!result.ok) {
    return {
      message:
        result.error === 'already-started'
          ? 'This consult already started.'
          : 'Only confirmed bookings can be cancelled.',
    };
  }
  await recordAudit(db, {
    actorId: admin.id,
    action: 'booking.cancelled',
    targetType: 'booking',
    targetId: bookingId,
    details: { by: 'admin', refundCents: result.booking.refundCents },
  });
  await notifyBookingCancelled(db, bookingId);
  revalidatePath('/admin/bookings');
  return { ok: true };
}
