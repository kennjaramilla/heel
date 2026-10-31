import { formatCents } from '@heel/core';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getDb, requireUser } from '@/lib/auth/server';
import { adminOverview } from '@/server/admin';

export const metadata: Metadata = { title: 'Admin' };

export default function AdminPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
      <Overview />
    </Suspense>
  );
}

async function Overview() {
  await requireUser(['admin']);
  const o = await adminOverview(getDb());
  const stat = (label: string, value: string | number, hint?: string) => (
    <div key={label} className="rounded-2xl border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-heading text-2xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
  return (
    <div className="grid gap-8">
      <section>
        <h1 className="text-2xl font-bold">Money, last 30 days</h1>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {stat('Gross bookings', formatCents(o.money.gross))}
          {stat('Heel fees', formatCents(o.money.fees), 'After refunds')}
          {stat('Refunds', formatCents(o.money.refunds))}
          {stat('Payouts pending', formatCents(o.money.payoutsPending))}
          {stat('Payouts paid', formatCents(o.money.payoutsPaid))}
        </div>
      </section>
      <section>
        <h2 className="text-lg font-semibold">People</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          {stat('Pet owners', o.users.owner ?? 0)}
          {stat('Trainers', o.users.trainer ?? 0)}
          {stat('Admins', o.users.admin ?? 0)}
          {stat('Suspended', o.suspended)}
        </div>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Bookings, all time</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-5">
          {(['confirmed', 'completed', 'cancelled', 'held', 'expired'] as const).map((s) =>
            stat(s[0]!.toUpperCase() + s.slice(1), o.bookings[s] ?? 0),
          )}
        </div>
      </section>
    </div>
  );
}
