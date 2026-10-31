import { formatCents } from '@heel/core';
import type { BookingStatus } from '@heel/db/schema';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { InlineAction } from '@/components/admin/inline-action';
import { Badge } from '@/components/ui/badge';
import { getDb, requireUser } from '@/lib/auth/server';
import { listAllBookings } from '@/server/admin';
import { adminCancelAction } from '../actions';

export const metadata: Metadata = { title: 'Bookings · Admin' };

const STATUSES: BookingStatus[] = ['confirmed', 'completed', 'cancelled', 'held', 'expired'];

export default function AdminBookingsPage({ searchParams }: PageProps<'/admin/bookings'>) {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Loading bookings…</p>}>
      <Bookings searchParams={searchParams} />
    </Suspense>
  );
}

async function Bookings({
  searchParams,
}: {
  searchParams: PageProps<'/admin/bookings'>['searchParams'];
}) {
  await requireUser(['admin']);
  const params = await searchParams;
  const status = STATUSES.find((s) => s === params.status);
  const rows = await listAllBookings(getDb(), { status });
  const now = new Date();

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/bookings"
          className={`rounded-full border px-3 py-1 text-sm ${!status ? 'border-primary bg-secondary' : 'border-border'}`}
        >
          All
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/bookings?status=${s}`}
            className={`rounded-full border px-3 py-1 text-sm capitalize ${status === s ? 'border-primary bg-secondary' : 'border-border'}`}
          >
            {s}
          </Link>
        ))}
      </div>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left text-muted-foreground">
            <tr>
              <th className="p-3 font-medium">Starts (UTC)</th>
              <th className="p-3 font-medium">Trainer</th>
              <th className="p-3 font-medium">Owner · pet</th>
              <th className="p-3 font-medium">Price</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map(({ booking: b, trainerName, ownerName }) => (
              <tr key={b.id}>
                <td className="p-3 whitespace-nowrap">
                  {b.startsAt.toISOString().slice(0, 16).replace('T', ' ')}
                </td>
                <td className="p-3">{trainerName}</td>
                <td className="p-3">
                  {ownerName} · {b.petName}
                </td>
                <td className="p-3">
                  {formatCents(b.priceCents)}
                  {b.refundCents > 0 && (
                    <span className="block text-xs text-muted-foreground">
                      refunded {formatCents(b.refundCents)}
                    </span>
                  )}
                </td>
                <td className="p-3">
                  <Badge
                    variant={b.status === 'confirmed' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {b.status}
                  </Badge>
                </td>
                <td className="p-3 text-right">
                  {b.status === 'confirmed' && b.startsAt > now && (
                    <InlineAction
                      action={adminCancelAction}
                      fields={{ bookingId: b.id }}
                      label="Cancel & refund"
                      confirmLabel={`Refund ${formatCents(b.priceCents)}`}
                      askReason
                      destructive
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-6 text-center text-muted-foreground">No bookings.</p>}
      </div>
    </div>
  );
}
