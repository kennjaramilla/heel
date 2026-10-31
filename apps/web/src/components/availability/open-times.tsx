'use client';

import { CalendarClock } from 'lucide-react';
import { useTimeZone } from '@/lib/use-time-zone';

/** Groups UTC start times by the viewer's own calendar day and shows them in their time zone. */
export function OpenTimes({ slots, maxDays = 5 }: { slots: string[]; maxDays?: number }) {
  const timeZone = useTimeZone();

  if (!timeZone) {
    return <div className="h-40 animate-pulse rounded-xl bg-muted" aria-hidden="true" />;
  }
  if (slots.length === 0) {
    return (
      <p className="flex items-center gap-2 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
        <CalendarClock className="size-4" aria-hidden="true" /> No open times in the next two weeks.
      </p>
    );
  }

  const dayKey = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const dayLabel = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const timeLabel = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
  });

  const days = new Map<string, Date[]>();
  for (const iso of slots) {
    const d = new Date(iso);
    const key = dayKey.format(d);
    days.set(key, [...(days.get(key) ?? []), d]);
  }

  return (
    <div className="grid gap-4">
      <p className="text-xs text-muted-foreground">
        Shown in your time zone: {timeZone.replaceAll('_', ' ')}
      </p>
      {[...days.values()].slice(0, maxDays).map((times) => (
        <div key={times[0]!.toISOString()}>
          <p className="text-sm font-medium">{dayLabel.format(times[0]!)}</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {times.slice(0, 6).map((t) => (
              <li
                key={t.toISOString()}
                className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
              >
                {timeLabel.format(t)}
              </li>
            ))}
            {times.length > 6 && (
              <li className="px-1 py-1 text-xs text-muted-foreground">+{times.length - 6} more</li>
            )}
          </ul>
        </div>
      ))}
    </div>
  );
}
