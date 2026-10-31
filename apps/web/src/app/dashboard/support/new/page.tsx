import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { TicketForm } from '@/components/support/ticket-form';
import { getDb, requireUser } from '@/lib/auth/server';
import { getBookingForUser } from '@/server/bookings';

export const metadata: Metadata = { title: 'New support request' };

export default function NewSupportPage({ searchParams }: PageProps<'/dashboard/support/new'>) {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6">
      <Link href="/dashboard/support" className="text-sm text-muted-foreground hover:underline">
        ← Help and support
      </Link>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">New support request</h1>
      <div className="mt-8">
        <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
          <Form searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function Form({
  searchParams,
}: {
  searchParams: PageProps<'/dashboard/support/new'>['searchParams'];
}) {
  const user = await requireUser(['owner', 'trainer']);
  const { booking: bookingId } = await searchParams;
  const booking =
    typeof bookingId === 'string' ? await getBookingForUser(getDb(), user.id, bookingId) : null;
  return (
    <TicketForm
      booking={
        booking
          ? {
              id: booking.id,
              label: `${booking.lengthMinutes}-minute consult with ${booking.trainerName} for ${booking.petName}`,
            }
          : undefined
      }
    />
  );
}
