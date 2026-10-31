'use client';

import { useTransition } from 'react';
import { markAllReadAction } from '@/app/dashboard/notifications/actions';
import { Button } from '@/components/ui/button';

export function MarkAllReadButton() {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={() => startTransition(() => markAllReadAction())}
    >
      {pending ? 'Marking…' : 'Mark all as read'}
    </Button>
  );
}
