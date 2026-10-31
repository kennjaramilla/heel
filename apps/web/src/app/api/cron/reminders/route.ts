import { getDb } from '@/lib/auth/server';
import { isCronRequest } from '@/lib/cron-auth';
import { sendReminders } from '@/server/notifications';

// Called hourly by .github/workflows/reminders.yml.
export async function GET(request: Request) {
  if (!isCronRequest(request)) return new Response('Unauthorized', { status: 401 });
  const reminded = await sendReminders(getDb());
  return Response.json({ reminded });
}
