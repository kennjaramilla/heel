import type { Metadata } from 'next';
import { Suspense } from 'react';
import { InlineAction } from '@/components/admin/inline-action';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { getDb, requireUser } from '@/lib/auth/server';
import { listUsers } from '@/server/admin';
import { suspendUserAction } from '../actions';

export const metadata: Metadata = { title: 'Users · Admin' };

const ROLES = ['owner', 'trainer', 'admin'] as const;

export default function UsersPage({ searchParams }: PageProps<'/admin/users'>) {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Loading users…</p>}>
      <Users searchParams={searchParams} />
    </Suspense>
  );
}

async function Users({
  searchParams,
}: {
  searchParams: PageProps<'/admin/users'>['searchParams'];
}) {
  const admin = await requireUser(['admin']);
  const params = await searchParams;
  const q = typeof params.q === 'string' ? params.q.slice(0, 80) : '';
  const role = ROLES.find((r) => r === params.role);
  const users = await listUsers(getDb(), { q, role });

  return (
    <div>
      <form className="flex flex-wrap gap-2" action="/admin/users">
        <Input name="q" defaultValue={q} placeholder="Name or email" className="w-64" />
        <select
          name="role"
          defaultValue={role ?? ''}
          className="h-9 rounded-lg border border-input bg-card px-3 text-sm"
        >
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <button className="h-9 rounded-lg bg-primary px-4 text-sm text-primary-foreground">
          Search
        </button>
      </form>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left text-muted-foreground">
            <tr>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Email</th>
              <th className="p-3 font-medium">Role</th>
              <th className="p-3 font-medium">Joined</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3 capitalize">{u.role}</td>
                <td className="p-3 text-muted-foreground">
                  {u.createdAt.toISOString().slice(0, 10)}
                </td>
                <td className="p-3">
                  {u.suspendedAt ? (
                    <Badge variant="destructive" title={u.suspendedReason ?? undefined}>
                      Suspended
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Active</Badge>
                  )}
                </td>
                <td className="p-3 text-right">
                  {u.role !== 'admin' && u.id !== admin.id && (
                    <InlineAction
                      action={suspendUserAction}
                      fields={{ userId: u.id, suspend: String(!u.suspendedAt) }}
                      label={u.suspendedAt ? 'Unsuspend' : 'Suspend'}
                      confirmLabel={u.suspendedAt ? 'Confirm unsuspend' : 'Confirm suspend'}
                      askReason={!u.suspendedAt}
                      destructive={!u.suspendedAt}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="p-6 text-center text-muted-foreground">No users match.</p>
        )}
      </div>
    </div>
  );
}
