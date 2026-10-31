import { formatCents } from '@heel/core';
import { CalendarCheck, CircleAlert, Clock, Dog, PartyPopper, Video } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { HoldCountdown } from '@/components/bookings/hold-countdown';
import { PayButton } from '@/components/bookings/pay-button';
import { LocalTime } from '@/components/local-time';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDb, requireUser } from '@/lib/auth/server';
import { type BookingView, getBookingForUser } from '@/server/bookings';
import { getPaymentProvider } from '@/server/payments';

export const metadata: Metadata = { title: 'Your booking' };

export default function BookingPage({ params }: PageProps<'/bookings/[id]'>) {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6">
      <Suspense fallback={<p className="text-muted-foreground">Loading your booking…</p>}>
        <BookingDetails params={params} />
      </Suspense>
    </div>
  );
}

async function BookingDetails({ params }: { params: PageProps<'/bookings/[id]'>['params'] }) {
  const user = await requireUser();
  const booking = await getBookingForUser(getDb(), user.id, (await params).id);
  if (!booking) notFound();

  const isOwner = booking.ownerId === user.id;
  const now = new Date();
  const holdLive =
    booking.status === 'held' && booking.holdExpiresAt && booking.holdExpiresAt > now;
  const holdGone = booking.status === 'expired' || (booking.status === 'held' && !holdLive);

  return (
    <div className="grid gap-6">
      {booking.status === 'confirmed' && (
        <div className="flex items-start gap-3 rounded-2xl bg-secondary p-5 text-secondary-foreground">
          <PartyPopper className="mt-0.5 size-6 shrink-0" aria-hidden="true" />
          <div>
            <h1 className="text-2xl font-bold">You&apos;re booked</h1>
            <p className="mt-1 text-sm">
              {isOwner
                ? `${booking.trainerName} will see you and ${booking.petName} on video.`
                : `${booking.ownerName} booked a consult for ${booking.petName}.`}
            </p>
          </div>
        </div>
      )}
      {holdLive && isOwner && (
        <h1 className="text-3xl font-bold tracking-tight">Confirm and pay</h1>
      )}
      {holdGone && (
        <div className="flex items-start gap-3 rounded-2xl bg-destructive/10 p-5 text-destructive">
          <CircleAlert className="mt-0.5 size-6 shrink-0" aria-hidden="true" />
          <div>
            <h1 className="text-xl font-bold">This hold expired</h1>
            <p className="mt-1 text-sm">
              The time was released so others can book it. You can pick it again if it&apos;s still
              free.
            </p>
          </div>
        </div>
      )}

      <Summary booking={booking} />

      {holdLive && isOwner && (
        <Card>
          <CardContent className="grid gap-4">
            <HoldCountdown expiresAt={booking.holdExpiresAt!.toISOString()} />
            <PriceBreakdown booking={booking} />
            <PayButton bookingId={booking.id} label={`Pay ${formatCents(booking.priceCents)}`} />
            <p className="text-center text-xs text-muted-foreground">
              {getPaymentProvider().label}
            </p>
          </CardContent>
        </Card>
      )}

      {booking.status === 'confirmed' && (
        <p className="flex items-center gap-2 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
          <Video className="size-4" aria-hidden="true" /> The video link appears here 10 minutes
          before the start.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" asChild>
          <Link href="/dashboard/bookings">All bookings</Link>
        </Button>
        {holdGone && booking.trainerSlug && (
          <Button asChild>
            <Link href={`/trainers/${booking.trainerSlug}`}>Pick another time</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

function Summary({ booking }: { booking: BookingView }) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-lg font-semibold">
          {booking.lengthMinutes}-minute consult with {booking.trainerName}
        </CardTitle>
        <Badge
          variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
          className="capitalize"
        >
          {booking.status === 'held' ? 'Held' : booking.status}
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        <p className="flex items-center gap-2">
          <CalendarCheck className="size-4 text-primary" aria-hidden="true" />
          <LocalTime iso={booking.startsAt.toISOString()} zone />
        </p>
        <p className="flex items-center gap-2">
          <Clock className="size-4 text-primary" aria-hidden="true" /> {booking.lengthMinutes}{' '}
          minutes on video
        </p>
        <p className="flex items-center gap-2">
          <Dog className="size-4 text-primary" aria-hidden="true" /> For {booking.petName}
        </p>
        {booking.ownerNote && (
          <p className="rounded-lg bg-muted p-3 text-muted-foreground">“{booking.ownerNote}”</p>
        )}
      </CardContent>
    </Card>
  );
}

function PriceBreakdown({ booking }: { booking: BookingView }) {
  return (
    <dl className="grid gap-1 text-sm">
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Consult</dt>
        <dd>{formatCents(booking.priceCents)}</dd>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <dt>Trainer receives</dt>
        <dd>{formatCents(booking.trainerPayoutCents)}</dd>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <dt>Heel fee (15%)</dt>
        <dd>{formatCents(booking.platformFeeCents)}</dd>
      </div>
    </dl>
  );
}
