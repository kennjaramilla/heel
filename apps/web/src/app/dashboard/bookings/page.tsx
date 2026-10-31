import { formatCents } from '@heel/core';
import { CalendarX } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { LocalTime } from '@/components/local-time';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getDb, requireUser } from '@/lib/auth/server';
import { type BookingView, listBookings } from '@/server/bookings';

export const metadata: Metadata = { title: 'Bookings' };

export default function BookingsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
      <Suspense fallback={<p className="mt-8 text-muted-foreground">Loading bookings…</p>}>
        <Lists />
      </Suspense>
    </div>
  );
}

async function Lists() {
  const user = await requireUser(['owner', 'trainer']);
  const role = user.role as 'owner' | 'trainer';
  const { upcoming, past } = await listBookings(getDb(), user.id, role);

  return (
    <div className="mt-8 grid gap-10">
      <section>
        <h2 className="text-lg font-semibold">Upcoming</h2>
        {upcoming.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-border p-8 text-center">
            <CalendarX className="mx-auto size-7 text-primary" aria-hidden="true" />
            <p className="mt-2 font-medium">No upcoming consults</p>
            {role === 'owner' && (
              <Button className="mt-4" asChild>
                <Link href="/trainers">Find a trainer</Link>
              </Button>
            )}
          </div>
        ) : (
          <BookingList bookings={upcoming} role={role} />
        )}
      </section>
      {past.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold">Past</h2>
          <BookingList bookings={past} role={role} />
        </section>
      )}
    </div>
  );
}

function BookingList({ bookings, role }: { bookings: BookingView[]; role: 'owner' | 'trainer' }) {
  return (
    <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
      {bookings.map((b) => (
        <li key={b.id}>
          <Link
            href={`/bookings/${b.id}`}
            className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-muted/50"
          >
            <div>
              <p className="font-medium">
                {role === 'owner' ? b.trainerName : b.ownerName} · {b.petName}
              </p>
              <p className="text-sm text-muted-foreground">
                <LocalTime iso={b.startsAt.toISOString()} style="short" /> · {b.lengthMinutes} min
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm">
                {formatCents(role === 'owner' ? b.priceCents : b.trainerPayoutCents)}
              </span>
              <Badge
                variant={b.status === 'confirmed' ? 'default' : 'secondary'}
                className="capitalize"
              >
                {b.status === 'held' ? 'Awaiting payment' : b.status}
              </Badge>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
