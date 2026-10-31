'use client';

import { useState } from 'react';
import type { AdminActionState } from '@/app/admin/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFormAction } from '@/lib/use-form-action';

const initialState: AdminActionState = {};

/** A small two-step admin action: click, optionally give a reason, confirm. */
export function InlineAction({
  action,
  fields,
  label,
  confirmLabel,
  askReason = false,
  destructive = false,
}: {
  action: (state: AdminActionState, form: FormData) => Promise<AdminActionState>;
  fields: Record<string, string>;
  label: string;
  confirmLabel: string;
  askReason?: boolean;
  destructive?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, onSubmit, pending] = useFormAction(action, initialState);

  if (!open) {
    return (
      <Button
        size="sm"
        variant={destructive ? 'destructive' : 'outline'}
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
    );
  }
  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-center gap-2">
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      {askReason && (
        <Input name="reason" placeholder="Reason" className="h-8 w-44" maxLength={200} />
      )}
      <Button
        size="sm"
        type="submit"
        variant={destructive ? 'destructive' : 'default'}
        disabled={pending}
      >
        {pending ? 'Working…' : confirmLabel}
      </Button>
      <Button size="sm" type="button" variant="ghost" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      {state.message && <span className="text-xs text-destructive">{state.message}</span>}
    </form>
  );
}
