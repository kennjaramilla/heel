import { getDb } from '@/lib/auth/server';
import { apiUser, json } from '@/lib/mobile-api';
import { listBookings } from '@/server/bookings';
import { toMobileBooking } from '@/server/mobile';

export async function GET() {
  const { user, error } = await apiUser(['owner', 'trainer']);
  if (error) return error;
  const { upcoming, past } = await listBookings(getDb(), user.id, user.role as 'owner' | 'trainer');
  return json({
    upcoming: upcoming.map((b) => toMobileBooking(b, user.id)),
    past: past.map((b) => toMobileBooking(b, user.id)),
  });
}
