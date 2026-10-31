'use client';

import { openTicketAction, type SupportState } from '@/app/dashboard/support/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormAction } from '@/lib/use-form-action';

const initialState: SupportState = {};

export function TicketForm({ booking }: { booking?: { id: string; label: string } }) {
  const [state, onSubmit, pending] = useFormAction(openTicketAction, initialState);
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {booking && (
        <>
          <input type="hidden" name="bookingId" value={booking.id} />
          <p className="rounded-lg bg-muted p-3 text-sm">About: {booking.label}</p>
        </>
      )}
      <div className="grid gap-2">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          name="subject"
          maxLength={120}
          placeholder="I was charged twice"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="message">How can we help?</Label>
        <textarea
          id="message"
          name="message"
          rows={6}
          maxLength={2000}
          placeholder="What happened, and what you'd like us to do."
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
          required
        />
      </div>
      {state.message && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? 'Sending…' : 'Send to Heel support'}
      </Button>
    </form>
  );
}
