'use client';

import { Bell } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export function NotificationBell() {
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);

  // Re-check on every navigation; cheap, and keeps the count fresh without polling.
  useEffect(() => {
    let active = true;
    fetch('/api/notifications', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { unread: 0 }))
      .then((d: { unread: number }) => active && setUnread(d.unread))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [pathname]);

  const label = unread ? `Notifications, ${unread} unread` : 'Notifications';
  return (
    <Button variant="ghost" size="icon" className="relative" asChild>
      <Link href="/dashboard/notifications" aria-label={label}>
        <Bell aria-hidden="true" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] leading-4 font-semibold text-primary-foreground ring-2 ring-background">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </Link>
    </Button>
  );
}
