import { getDb, getSession } from '@/lib/auth/server';
import { exportAccountData } from '@/server/account';

export async function GET() {
  const session = await getSession();
  if (!session) return new Response('Unauthorized', { status: 401 });
  const data = await exportAccountData(getDb(), session.user.id);
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="heel-my-data.json"',
      'Cache-Control': 'no-store',
    },
  });
}
