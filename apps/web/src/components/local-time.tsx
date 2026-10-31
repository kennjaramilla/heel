'use client';

import { useTimeZone } from '@/lib/use-time-zone';

const styles = {
  full: { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' },
  short: { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' },
} as const;

/** A date and time in the viewer's own time zone. */
export function LocalTime({
  iso,
  style = 'full',
  zone = false,
}: {
  iso: string;
  style?: keyof typeof styles;
  zone?: boolean;
}) {
  const timeZone = useTimeZone();
  if (!timeZone)
    return <span className="inline-block h-4 w-40 animate-pulse rounded bg-muted align-middle" />;
  const text = new Intl.DateTimeFormat('en-US', {
    ...styles[style],
    timeZone,
    timeZoneName: zone ? 'short' : undefined,
  }).format(new Date(iso));
  return <time dateTime={iso}>{text}</time>;
}
