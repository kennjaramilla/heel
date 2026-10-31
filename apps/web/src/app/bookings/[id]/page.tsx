import { formatCents, refundFor } from '@heel/core';
import {
  Ban,
  CalendarCheck,
  CircleAlert,
  ClipboardList,
  Clock,
  Dog,
  PartyPopper,
  Video,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { CancelPanel } from '@/components/bookings/cancel-panel';
import { HoldCountdown } from '@/components/bookings/hold-countdown';
import { PayButton } from '@/components/bookings/pay-button';
import { PlanForm } from '@/components/bookings/plan-form';
import { ReleaseHoldButton } from '@/components/bookings/release-hold-button';
import { LocalTime } from '@/components/local-time';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDb, requireUser } from '@/lib/auth/server';
import { type BookingView, getBookingForUser } from '@/server/bookings';
import { getTrainingPlan } from '@/server/completion';
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
  const db = getDb();
  const booking = await getBookingForUser(db, user.id, (await params).id);
  if (!booking) notFound();
  const plan = await getTrainingPlan(db, booking.id);

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
      {booking.status === 'cancelled' && (
        <div className="flex items-start gap-3 rounded-2xl bg-muted p-5">
          <Ban className="mt-0.5 size-6 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div>
            <h1 className="text-2xl font-bold">Cancelled</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {cancelledText(booking, isOwner)}
              {booking.cancelReason && <> Reason: “{booking.cancelReason}”</>}
            </p>
          </div>
        </div>
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
            <ReleaseHoldButton bookingId={booking.id} />
          </CardContent>
        </Card>
      )}

      {booking.status === 'confirmed' && (
        <p className="flex items-center gap-2 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
          <Video className="size-4" aria-hidden="true" /> The video link appears here 10 minutes
          before the start.
        </p>
      )}

      {booking.status === 'confirmed' && booking.startsAt > now && (
        <Cancel booking={booking} isOwner={isOwner} now={now} />
      )}

      {(booking.status === 'confirmed' || booking.status === 'completed') &&
        booking.endsAt <= now && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <ClipboardList className="size-5 text-amber" aria-hidden="true" />
                {booking.petName}&apos;s training plan
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {!isOwner ? (
                <>
                  {!plan && (
                    <p className="text-sm text-muted-foreground">
                      Sending the plan completes the consult. Your payout of{' '}
                      {formatCents(booking.trainerPayoutCents)} is released 24 hours later.
                    </p>
                  )}
                  <PlanForm
                    bookingId={booking.id}
                    petName={booking.petName}
                    initial={plan ?? undefined}
                  />
                </>
              ) : plan ? (
                <>
                  <p className="whitespace-pre-line text-sm">{plan.summary}</p>
                  <ol className="grid gap-2">
                    {plan.steps.map((step, i) => (
                      <li key={i} className="flex gap-3 rounded-xl bg-muted p-3 text-sm">
                        <span className="font-heading font-semibold text-primary">{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {booking.trainerName} will send {booking.petName}&apos;s plan here soon.
                </p>
              )}
            </CardContent>
          </Card>
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

function cancelledText(booking: BookingView, isOwner: boolean) {
  const who =
    booking.cancelledBy === (isOwner ? 'owner' : 'trainer')
      ? 'You cancelled this consult.'
      : booking.cancelledBy === 'admin'
        ? 'Heel cancelled this consult.'
        : `${isOwner ? booking.trainerName : booking.ownerName} cancelled this consult.`;
  const money = isOwner
    ? booking.refundCents > 0
      ? ` ${formatCents(booking.refundCents)} was refunded to your card.`
      : ''
    : booking.trainerPayoutCents > 0
      ? ` You keep ${formatCents(booking.trainerPayoutCents)} for the late cancellation.`
      : '';
  return who + money;
}

function Cancel({ booking, isOwner, now }: { booking: BookingView; isOwner: boolean; now: Date }) {
  const decision = refundFor(booking, isOwner ? 'owner' : 'trainer', now);
  if (!decision.allowed) return null;
  const policy = isOwner
    ? decision.percent === 100
      ? `You'll get the full ${formatCents(decision.refundCents)} back.`
      : `It's less than 24 hours away, so you'll get ${formatCents(decision.refundCents)} back (50%).`
    : `${booking.ownerName} will get a full refund of ${formatCents(decision.refundCents)}, and you won't be paid for this consult.`;
  return (
    <CancelPanel
      bookingId={booking.id}
      policy={policy}
      confirmLabel={`Yes, cancel and refund ${formatCents(decision.refundCents)}`}
    />
  );
}
