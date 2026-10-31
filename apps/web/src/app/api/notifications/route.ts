import { getDb, getSession } from '@/lib/auth/server';
import { unreadCount } from '@/server/notifications';

// Unread count for the header bell, which renders on the client so pages stay static.
export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ unread: 0 }, { status: 401 });
  return Response.json(
    { unread: await unreadCount(getDb(), session.user.id) },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
