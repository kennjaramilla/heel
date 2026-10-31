import type { SupportStatus } from '@heel/db/schema';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { LocalTime } from '@/components/local-time';
import { StatusBadge } from '@/components/support/ticket-thread';
import { getDb, requireUser } from '@/lib/auth/server';
import { cn } from '@/lib/utils';
import { listAllTickets } from '@/server/support';

export const metadata: Metadata = { title: 'Support · Admin' };

const FILTERS: { status?: SupportStatus; label: string }[] = [
  { status: 'open', label: 'Needs a reply' },
  { status: 'answered', label: 'Answered' },
  { status: 'closed', label: 'Closed' },
  { label: 'All' },
];

export default function AdminSupportPage({ searchParams }: PageProps<'/admin/support'>) {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Loading requests…</p>}>
      <Tickets searchParams={searchParams} />
    </Suspense>
  );
}

async function Tickets({
  searchParams,
}: {
  searchParams: PageProps<'/admin/support'>['searchParams'];
}) {
  await requireUser(['admin']);
  const params = await searchParams;
  // Default to the queue that needs attention.
  const status =
    params.status === 'all'
      ? undefined
      : (FILTERS.find((f) => f.status === params.status)?.status ?? 'open');
  const rows = await listAllTickets(getDb(), { status });

  return (
    <div>
      <nav aria-label="Filter requests" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.label}
            href={`/admin/support?status=${f.status ?? 'all'}`}
            aria-current={f.status === status ? 'page' : undefined}
            className={cn(
              'rounded-full border border-border px-3 py-1 text-sm',
              f.status === status && 'border-primary bg-primary text-primary-foreground',
            )}
          >
            {f.label}
          </Link>
        ))}
      </nav>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left text-muted-foreground">
            <tr>
              <th className="p-3 font-medium">Subject</th>
              <th className="p-3 font-medium">From</th>
              <th className="p-3 font-medium">Updated</th>
              <th className="p-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map(({ ticket, userName, userRole }) => (
              <tr key={ticket.id}>
                <td className="p-3 font-medium">
                  <Link href={`/admin/support/${ticket.id}`} className="hover:underline">
                    {ticket.subject}
                  </Link>
                </td>
                <td className="p-3">
                  {userName} <span className="text-muted-foreground capitalize">({userRole})</span>
                </td>
                <td className="p-3 text-muted-foreground">
                  <LocalTime iso={ticket.updatedAt.toISOString()} style="short" />
                </td>
                <td className="p-3">
                  <StatusBadge status={ticket.status} staff />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="p-6 text-center text-muted-foreground">Nothing here. Nice.</p>
        )}
      </div>
    </div>
  );
}
