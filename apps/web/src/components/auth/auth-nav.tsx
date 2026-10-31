'use client';

import Link from 'next/link';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth/client';

// Client-side so the header (and the landing page) stay static.
export function AuthNav() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return <div className="h-9 w-40" aria-hidden="true" />;

  if (session) {
    return (
      <div className="flex items-center gap-1">
        <NotificationBell />
        <Button asChild>
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" asChild>
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild>
        <Link href="/sign-up">Get started</Link>
      </Button>
    </div>
  );
}
