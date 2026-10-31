import type { Metadata } from 'next';
import { Suspense } from 'react';
import {
  DeleteAccount,
  NameForm,
  PasswordForm,
  SessionsAndExport,
} from '@/components/account/account-forms';
import { requireUser } from '@/lib/auth/server';

export const metadata: Metadata = { title: 'Account and privacy' };

export default function AccountPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Account and privacy</h1>
      <Suspense fallback={<p className="mt-8 text-muted-foreground">Loading…</p>}>
        <Account />
      </Suspense>
    </div>
  );
}

async function Account() {
  const me = await requireUser();
  const section = (title: string, body: string, children: React.ReactNode) => (
    <section className="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{body}</p>
      </div>
      {children}
    </section>
  );
  return (
    <div className="mt-8 grid gap-6">
      {section('Profile', `Signed in as ${me.email}.`, <NameForm name={me.name} />)}
      {section('Password', 'Changing it signs you out on your other devices.', <PasswordForm />)}
      {section(
        'Your data',
        'Download everything Heel holds about you, or sign out of every other device.',
        <SessionsAndExport />,
      )}
      {me.role !== 'admin' &&
        section(
          'Delete account',
          'You can delete your account once you have no upcoming consults.',
          <DeleteAccount />,
        )}
    </div>
  );
}
