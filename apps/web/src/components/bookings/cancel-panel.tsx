'use client';

import { useState } from 'react';
import { cancelBookingAction, type CancelState } from '@/app/bookings/actions';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useFormAction } from '@/lib/use-form-action';

const initialState: CancelState = {};

/** Two-step cancel: first shows exactly what happens to the money, then asks to confirm. */
export function CancelPanel({
  bookingId,
  policy,
  confirmLabel,
}: {
  bookingId: string;
  policy: string;
  confirmLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, onSubmit, pending] = useFormAction(cancelBookingAction, initialState);

  if (!open) {
    return (
      <Button
        variant="ghost"
        className="w-fit text-destructive hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        Cancel booking
      </Button>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4"
    >
      <input type="hidden" name="bookingId" value={bookingId} />
      <p className="text-sm">{policy}</p>
      <div className="grid gap-2">
        <Label htmlFor="reason">Reason (optional, shared with the other person)</Label>
        <textarea
          id="reason"
          name="reason"
          rows={2}
          maxLength={300}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      {state.message && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="destructive" disabled={pending}>
          {pending ? 'Cancelling…' : confirmLabel}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Keep booking
        </Button>
      </div>
    </form>
  );
}
