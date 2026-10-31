import { getDb } from '@/lib/auth/server';
import { isCronRequest } from '@/lib/cron-auth';
import { recordAudit } from '@/server/audit';
import { autoCompleteConsults, releaseDuePayouts } from '@/server/completion';
import { notifyPayoutsPaid, sendReminders } from '@/server/notifications';
import { getPaymentProvider } from '@/server/payments';

// Called once a day by Vercel Cron (see vercel.json).
export async function GET(request: Request) {
  if (!isCronRequest(request)) return new Response('Unauthorized', { status: 401 });
  const db = getDb();
  const provider = getPaymentProvider();
  const completed = await autoCompleteConsults(db);
  const paid = await releaseDuePayouts(db, (booking) => provider.payout(booking));
  for (const id of paid) {
    await recordAudit(db, {
      actorId: null,
      action: 'payout.released',
      targetType: 'booking',
      targetId: id,
    });
  }
  await notifyPayoutsPaid(db, paid);
  // Hobby crons run daily, so reminders also run hourly from GitHub Actions (reminders.yml).
  const reminded = await sendReminders(db);
  return Response.json({ completed, paid: paid.length, reminded });
}
