import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getDb, requireUser } from '@/lib/auth/server';
import { listAudit } from '@/server/audit';

export const metadata: Metadata = { title: 'Audit log · Admin' };

export default function AuditPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
      <Audit />
    </Suspense>
  );
}

async function Audit() {
  await requireUser(['admin']);
  const events = await listAudit(getDb(), 200);
  return (
    <div>
      <p className="text-sm text-muted-foreground">
        The last 200 events. Entries are never edited or deleted.
      </p>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left text-muted-foreground">
            <tr>
              <th className="p-3 font-medium">When (UTC)</th>
              <th className="p-3 font-medium">Who</th>
              <th className="p-3 font-medium">Action</th>
              <th className="p-3 font-medium">Target</th>
              <th className="p-3 font-medium">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {events.map(({ event: e, actorName, actorEmail }) => (
              <tr key={e.id}>
                <td className="p-3 whitespace-nowrap">
                  {e.createdAt.toISOString().slice(0, 19).replace('T', ' ')}
                </td>
                <td className="p-3">
                  {actorName ? (
                    <span title={actorEmail ?? undefined}>{actorName}</span>
                  ) : (
                    <span className="text-muted-foreground">System</span>
                  )}
                </td>
                <td className="p-3 font-mono text-xs">{e.action}</td>
                <td className="p-3 font-mono text-xs">
                  {e.targetType}:{e.targetId.slice(0, 8)}
                </td>
                <td className="p-3 font-mono text-xs text-muted-foreground">
                  {Object.keys(e.details).length ? JSON.stringify(e.details) : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {events.length === 0 && (
          <p className="p-6 text-center text-muted-foreground">Nothing yet.</p>
        )}
      </div>
    </div>
  );
}
