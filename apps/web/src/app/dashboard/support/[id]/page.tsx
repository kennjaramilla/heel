import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { TicketThread } from '@/components/support/ticket-thread';
import { getDb, requireUser } from '@/lib/auth/server';
import { getTicket } from '@/server/support';

export const metadata: Metadata = { title: 'Support request' };

export default function TicketPage({ params }: PageProps<'/dashboard/support/[id]'>) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <Link href="/dashboard/support" className="text-sm text-muted-foreground hover:underline">
        ← Help and support
      </Link>
      <div className="mt-4">
        <Suspense fallback={<p className="text-muted-foreground">Loading your request…</p>}>
          <Ticket params={params} />
        </Suspense>
      </div>
    </div>
  );
}

async function Ticket({ params }: { params: PageProps<'/dashboard/support/[id]'>['params'] }) {
  const user = await requireUser(['owner', 'trainer']);
  const data = await getTicket(getDb(), user, (await params).id);
  if (!data) notFound();
  return <TicketThread data={data} staff={false} />;
}
