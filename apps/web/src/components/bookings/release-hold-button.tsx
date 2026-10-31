'use client';

import { useTransition } from 'react';
import { releaseHoldAction } from '@/app/bookings/actions';
import { Button } from '@/components/ui/button';

export function ReleaseHoldButton({ bookingId }: { bookingId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      className="w-full"
      disabled={pending}
      onClick={() => startTransition(() => releaseHoldAction(bookingId))}
    >
      {pending ? 'Releasing…' : 'Choose a different time'}
    </Button>
  );
}
