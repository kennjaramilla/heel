'use client';

import { replyAction, type SupportState } from '@/app/dashboard/support/actions';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useFormAction } from '@/lib/use-form-action';

const initialState: SupportState = {};

export function ReplyForm({ ticketId, staff }: { ticketId: string; staff: boolean }) {
  const [state, onSubmit, pending] = useFormAction(replyAction, initialState);
  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <input type="hidden" name="ticketId" value={ticketId} />
      <Label htmlFor="body">{staff ? 'Reply as Heel support' : 'Add a reply'}</Label>
      {/* Remount after each send so the box clears. */}
      <textarea
        key={state.sentAt ?? 0}
        id="body"
        name="body"
        rows={4}
        maxLength={2000}
        className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        required
      />
      {state.message && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? 'Sending…' : 'Send reply'}
      </Button>
    </form>
  );
}
