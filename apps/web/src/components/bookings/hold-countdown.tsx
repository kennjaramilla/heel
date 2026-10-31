'use client';

import { Timer } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/** Shows how long the slot stays held, and refreshes the page when the hold runs out. */
export function HoldCountdown({ expiresAt }: { expiresAt: string }) {
  const router = useRouter();
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const end = new Date(expiresAt).getTime();
    const tick = () => {
      const ms = end - Date.now();
      setLeft(Math.max(0, ms));
      if (ms <= 0) router.refresh();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt, router]);

  if (left === null) return null;
  const m = Math.floor(left / 60_000);
  const s = Math.floor((left % 60_000) / 1000);
  return (
    <p
      className="flex items-center gap-2 rounded-xl bg-accent px-3 py-2 text-sm text-accent-foreground"
      role="timer"
    >
      <Timer className="size-4" aria-hidden="true" />
      We&apos;re holding this time for {m}:{String(s).padStart(2, '0')}
    </p>
  );
}
