import { getDb } from '@/lib/auth/server';
import { recordAudit } from '@/server/audit';
import { autoCompleteConsults, releaseDuePayouts } from '@/server/completion';
import { getPaymentProvider } from '@/server/payments';

// Called once a day by Vercel Cron (see vercel.json). Vercel sends the CRON_SECRET as a bearer token.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401 });
  }
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
  return Response.json({ completed, paid: paid.length });
}
