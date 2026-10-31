import type { UserRole } from '@heel/db/schema';
import { getSession } from '@/lib/auth/server';

const noStore = { 'Cache-Control': 'no-store' };

export const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: noStore });

/** The signed-in user for an API route, or an error response to return as is. */
export async function apiUser(roles?: UserRole[]) {
  const session = await getSession();
  if (!session) return { error: json({ error: 'unauthorized' }, 401) } as const;
  const role = session.user.role as UserRole;
  if (roles && !roles.includes(role)) return { error: json({ error: 'forbidden' }, 403) } as const;
  return { user: { ...session.user, role } } as const;
}
