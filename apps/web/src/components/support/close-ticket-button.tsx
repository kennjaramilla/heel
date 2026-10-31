'use client';

import { useTransition } from 'react';
import { closeTicketAction } from '@/app/dashboard/support/actions';
import { Button } from '@/components/ui/button';

export function CloseTicketButton({ ticketId, staff }: { ticketId: string; staff: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={() => startTransition(() => closeTicketAction(ticketId))}
    >
      {pending ? 'Closing…' : staff ? 'Close request' : 'Mark as solved'}
    </Button>
  );
}
