import { LifeBuoy, Plus } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { LocalTime } from '@/components/local-time';
import { StatusBadge } from '@/components/support/ticket-thread';
import { Button } from '@/components/ui/button';
import { getDb, requireUser } from '@/lib/auth/server';
import { listTicketsForUser } from '@/server/support';

export const metadata: Metadata = { title: 'Help and support' };

export default function SupportPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Help and support</h1>
          <p className="mt-1 text-muted-foreground">
            Questions about a booking, a refund or your account. We usually reply within a day.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/support/new">
            <Plus aria-hidden="true" /> New request
          </Link>
        </Button>
      </div>
      <Suspense fallback={<p className="mt-8 text-muted-foreground">Loading your requests…</p>}>
        <Tickets />
      </Suspense>
    </div>
  );
}

async function Tickets() {
  const user = await requireUser(['owner', 'trainer']);
  const tickets = await listTicketsForUser(getDb(), user.id);
  if (tickets.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center">
        <LifeBuoy className="mx-auto size-7 text-primary" aria-hidden="true" />
        <p className="mt-2 font-medium">No requests yet</p>
        <p className="text-sm text-muted-foreground">If something goes wrong, we&apos;re here.</p>
      </div>
    );
  }
  return (
    <ul className="mt-8 divide-y divide-border rounded-2xl border border-border bg-card">
      {tickets.map((t) => (
        <li key={t.id}>
          <Link
            href={`/dashboard/support/${t.id}`}
            className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-muted/50"
          >
            <div>
              <p className="font-medium">{t.subject}</p>
              <p className="text-sm text-muted-foreground">
                Updated <LocalTime iso={t.updatedAt.toISOString()} style="short" />
              </p>
            </div>
            <StatusBadge status={t.status} staff={false} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
