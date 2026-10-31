// Time zone math with nothing but Intl, so it runs the same in Node, browsers and React Native.

export type LocalDate = { year: number; month: number; day: number }; // month 1-12

const formatters = new Map<string, Intl.DateTimeFormat>();
function formatter(timeZone: string) {
  let f = formatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
    formatters.set(timeZone, f);
  }
  return f;
}

/** The wall-clock date and time in a zone at a given instant. */
export function zonedParts(instant: Date, timeZone: string) {
  const parts = Object.fromEntries(
    formatter(timeZone)
      .formatToParts(instant)
      .filter((p) => p.type !== 'literal')
      .map((p) => [p.type, Number(p.value)]),
  ) as Record<'year' | 'month' | 'day' | 'hour' | 'minute' | 'second', number>;
  return parts;
}

/** Minutes the zone is ahead of UTC at an instant (Manila +480, New York -240 or -300). */
export function offsetMinutes(instant: Date, timeZone: string) {
  const p = zonedParts(instant, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - Math.floor(instant.getTime() / 1000) * 1000) / 60_000);
}

/**
 * The instant when the wall clock in `timeZone` reads `date` at `minuteOfDay`.
 * Returns null for times skipped by a daylight-saving jump (e.g. 2:30 AM on the spring-forward day).
 * For repeated times in the autumn, returns the first occurrence.
 */
export function zonedTimeToUtc(
  date: LocalDate,
  minuteOfDay: number,
  timeZone: string,
): Date | null {
  const wall = Date.UTC(date.year, date.month - 1, date.day, 0, minuteOfDay);
  // Try the offsets in effect a day before and a day after; one of them is right unless the time doesn't exist.
  const candidates = [
    offsetMinutes(new Date(wall - 86_400_000), timeZone),
    offsetMinutes(new Date(wall + 86_400_000), timeZone),
  ]
    .sort((a, b) => b - a) // larger offset first = earlier instant, so autumn's repeated hour picks the first one
    .map((offset) => new Date(wall - offset * 60_000));
  for (const instant of candidates) {
    const p = zonedParts(instant, timeZone);
    if (
      p.year === date.year &&
      p.month === date.month &&
      p.day === date.day &&
      p.hour * 60 + p.minute === minuteOfDay
    ) {
      return instant;
    }
  }
  return null;
}

/** The local calendar date in a zone at an instant. */
export function zonedDate(instant: Date, timeZone: string): LocalDate {
  const { year, month, day } = zonedParts(instant, timeZone);
  return { year, month, day };
}

export function addDays(date: LocalDate, days: number): LocalDate {
  const d = new Date(Date.UTC(date.year, date.month - 1, date.day + days));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

/** 0 = Sunday ... 6 = Saturday, for a calendar date (no time zone involved). */
export function weekday(date: LocalDate) {
  return new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay();
}

export function toIsoDate(date: LocalDate) {
  return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
}

export function parseIsoDate(value: string): LocalDate | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const date = { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
  return toIsoDate(addDays(date, 0)) === value ? date : null;
}

/** "9:00 AM" style label for minutes after midnight. */
export function formatMinuteOfDay(minute: number) {
  const h = Math.floor(minute / 60) % 24;
  const m = minute % 60;
  const suffix = h < 12 ? 'AM' : 'PM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
}
