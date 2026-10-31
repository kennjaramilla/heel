import { BellOff } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { LocalTime } from '@/components/local-time';
import { MarkAllReadButton } from '@/components/notifications/mark-all-read-button';
import { getDb, requireUser } from '@/lib/auth/server';
import { cn } from '@/lib/utils';
import { listNotifications } from '@/server/notifications';

export const metadata: Metadata = { title: 'Notifications' };

export default function NotificationsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
      <Suspense fallback={<p className="mt-8 text-muted-foreground">Loading…</p>}>
        <List />
      </Suspense>
    </div>
  );
}

async function List() {
  const user = await requireUser();
  const items = await listNotifications(getDb(), user.id);
  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center">
        <BellOff className="mx-auto size-7 text-primary" aria-hidden="true" />
        <p className="mt-2 font-medium">All quiet</p>
        <p className="text-sm text-muted-foreground">
          Bookings, reminders and replies will show up here.
        </p>
      </div>
    );
  }
  const unread = items.some((n) => !n.readAt);
  return (
    <>
      {unread && (
        <div className="mt-4">
          <MarkAllReadButton />
        </div>
      )}
      <ul className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card">
        {items.map((n) => (
          <li key={n.id}>
            <Link
              href={n.href}
              className={cn('flex gap-3 p-4 hover:bg-muted/50', !n.readAt && 'bg-secondary/40')}
            >
              <span
                className={cn(
                  'mt-1.5 size-2 shrink-0 rounded-full',
                  n.readAt ? 'bg-transparent' : 'bg-primary',
                )}
                aria-hidden="true"
              />
              <div>
                <p className="font-medium">
                  {n.title}
                  {!n.readAt && <span className="sr-only"> (unread)</span>}
                </p>
                <p className="text-sm text-muted-foreground">{n.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  <LocalTime iso={n.createdAt.toISOString()} style="short" />
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
