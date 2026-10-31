import { getDb } from '@/lib/auth/server';
import { apiUser, json } from '@/lib/mobile-api';
import { getBookingForUser } from '@/server/bookings';
import { getTrainingPlan } from '@/server/completion';
import { toMobileBooking } from '@/server/mobile';

export async function GET(_request: Request, ctx: RouteContext<'/api/mobile/bookings/[id]'>) {
  const { user, error } = await apiUser(['owner', 'trainer']);
  if (error) return error;
  const db = getDb();
  const booking = await getBookingForUser(db, user.id, (await ctx.params).id);
  if (!booking) return json({ error: 'not-found' }, 404);
  return json(toMobileBooking(booking, user.id, await getTrainingPlan(db, booking.id)));
}
