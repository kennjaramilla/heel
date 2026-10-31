import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { TicketThread } from '@/components/support/ticket-thread';
import { getDb, requireUser } from '@/lib/auth/server';
import { getTicket } from '@/server/support';

export const metadata: Metadata = { title: 'Support request · Admin' };

export default function AdminTicketPage({ params }: PageProps<'/admin/support/[id]'>) {
  return (
    <div className="max-w-2xl">
      <Link href="/admin/support" className="text-sm text-muted-foreground hover:underline">
        ← All requests
      </Link>
      <div className="mt-4">
        <Suspense fallback={<p className="text-muted-foreground">Loading request…</p>}>
          <Ticket params={params} />
        </Suspense>
      </div>
    </div>
  );
}

async function Ticket({ params }: { params: PageProps<'/admin/support/[id]'>['params'] }) {
  const admin = await requireUser(['admin']);
  const data = await getTicket(getDb(), admin, (await params).id);
  if (!data) notFound();
  return <TicketThread data={data} staff />;
}
