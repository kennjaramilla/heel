'use client';

import { Download, LogOut } from 'lucide-react';
import { useState } from 'react';
import {
  type AccountState,
  deleteAccountAction,
  updateNameAction,
} from '@/app/dashboard/account/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth/client';
import { useFormAction } from '@/lib/use-form-action';
import { cn } from '@/lib/utils';

const initial: AccountState = {};

function Status({ state }: { state: AccountState }) {
  if (!state.message) return null;
  return (
    <p role="status" className={cn('text-sm', state.ok ? 'text-primary' : 'text-destructive')}>
      {state.message}
    </p>
  );
}

export function NameForm({ name }: { name: string }) {
  const [state, onSubmit, pending] = useFormAction(updateNameAction, initial);
  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={name} maxLength={80} className="w-64" required />
      </div>
      <Button type="submit" variant="outline" disabled={pending}>
        Save
      </Button>
      <Status state={state} />
    </form>
  );
}

export function PasswordForm() {
  const [state, setState] = useState<AccountState>({});
  const [pending, setPending] = useState(false);
  return (
    <form
      className="grid max-w-sm gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const data = new FormData(form);
        setPending(true);
        const { error } = await authClient.changePassword({
          currentPassword: String(data.get('current')),
          newPassword: String(data.get('next')),
          revokeOtherSessions: true,
        });
        setPending(false);
        if (error) return setState({ message: error.message ?? 'Could not change your password.' });
        form.reset();
        setState({ ok: true, message: 'Password changed. Other devices were signed out.' });
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor="current">Current password</Label>
        <Input
          id="current"
          name="current"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="next">New password</Label>
        <Input
          id="next"
          name="next"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      <Button type="submit" variant="outline" className="w-fit" disabled={pending}>
        {pending ? 'Changing…' : 'Change password'}
      </Button>
      <Status state={state} />
    </form>
  );
}

export function SessionsAndExport() {
  const [state, setState] = useState<AccountState>({});
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        variant="outline"
        onClick={async () => {
          const { error } = await authClient.revokeOtherSessions();
          setState(
            error
              ? { message: 'Could not sign out other devices.' }
              : { ok: true, message: 'Signed out everywhere else.' },
          );
        }}
      >
        <LogOut aria-hidden="true" /> Sign out other devices
      </Button>
      <Button variant="outline" asChild>
        <a href="/api/account/export" download>
          <Download aria-hidden="true" /> Download my data
        </a>
      </Button>
      <Status state={state} />
    </div>
  );
}

export function DeleteAccount() {
  const [open, setOpen] = useState(false);
  const [state, onSubmit, pending] = useFormAction(deleteAccountAction, initial);
  if (!open) {
    return (
      <Button
        variant="ghost"
        className="w-fit text-destructive hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        Delete my account
      </Button>
    );
  }
  return (
    <form
      onSubmit={onSubmit}
      className="grid max-w-md gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4"
    >
      <p className="text-sm">
        Your login, pets and trainer profile are removed. Past bookings stay in our records without
        your name, because they&apos;re part of payment history. This can&apos;t be undone.
      </p>
      <div className="grid gap-2">
        <Label htmlFor="confirm">Type DELETE to confirm</Label>
        <Input id="confirm" name="confirm" autoComplete="off" />
      </div>
      <Status state={state} />
      <div className="flex gap-2">
        <Button type="submit" variant="destructive" disabled={pending}>
          {pending ? 'Deleting…' : 'Delete account'}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Keep my account
        </Button>
      </div>
    </form>
  );
}
