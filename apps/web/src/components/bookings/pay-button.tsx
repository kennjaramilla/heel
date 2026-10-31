'use client';

import { useTransition } from 'react';
import { payForBooking } from '@/app/bookings/actions';
import { Button } from '@/components/ui/button';

export function PayButton({ bookingId, label }: { bookingId: string; label: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="lg"
      className="w-full"
      disabled={pending}
      onClick={() => startTransition(() => payForBooking(bookingId))}
    >
      {pending ? 'Processing…' : label}
    </Button>
  );
}
