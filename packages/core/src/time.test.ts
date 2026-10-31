import { describe, expect, it } from 'vitest';
import {
  addDays,
  formatMinuteOfDay,
  offsetMinutes,
  parseIsoDate,
  weekday,
  zonedDate,
  zonedTimeToUtc,
} from './time';

const iso = (d: Date | null) => d?.toISOString() ?? null;

describe('zonedTimeToUtc', () => {
  it('converts zones without daylight saving', () => {
    // 9:00 AM in Manila (UTC+8) is 1:00 AM UTC.
    expect(iso(zonedTimeToUtc({ year: 2026, month: 3, day: 9 }, 9 * 60, 'Asia/Manila'))).toBe(
      '2026-03-09T01:00:00.000Z',
    );
  });

  it('uses the right offset on each side of a daylight-saving change', () => {
    // New York moves from UTC-5 to UTC-4 on 8 March 2026.
    expect(iso(zonedTimeToUtc({ year: 2026, month: 3, day: 7 }, 9 * 60, 'America/New_York'))).toBe(
      '2026-03-07T14:00:00.000Z',
    );
    expect(iso(zonedTimeToUtc({ year: 2026, month: 3, day: 9 }, 9 * 60, 'America/New_York'))).toBe(
      '2026-03-09T13:00:00.000Z',
    );
  });

  it('returns null for wall-clock times that are skipped in spring', () => {
    expect(
      zonedTimeToUtc({ year: 2026, month: 3, day: 8 }, 2 * 60 + 30, 'America/New_York'),
    ).toBeNull();
  });

  it('picks the first occurrence of times repeated in autumn', () => {
    // 1 Nov 2026: 1:30 AM happens twice in New York (EDT, then EST).
    expect(iso(zonedTimeToUtc({ year: 2026, month: 11, day: 1 }, 90, 'America/New_York'))).toBe(
      '2026-11-01T05:30:00.000Z',
    );
  });

  it('handles Europe changing on a different weekend than the US', () => {
    // Berlin moves to summer time on 29 March 2026.
    expect(iso(zonedTimeToUtc({ year: 2026, month: 3, day: 28 }, 10 * 60, 'Europe/Berlin'))).toBe(
      '2026-03-28T09:00:00.000Z',
    );
    expect(iso(zonedTimeToUtc({ year: 2026, month: 3, day: 30 }, 10 * 60, 'Europe/Berlin'))).toBe(
      '2026-03-30T08:00:00.000Z',
    );
  });
});

describe('helpers', () => {
  it('reads offsets and local dates', () => {
    const instant = new Date('2026-07-01T23:30:00Z');
    expect(offsetMinutes(instant, 'Asia/Manila')).toBe(480);
    expect(offsetMinutes(instant, 'America/Los_Angeles')).toBe(-420);
    expect(zonedDate(instant, 'Asia/Manila')).toEqual({ year: 2026, month: 7, day: 2 });
    expect(zonedDate(instant, 'America/Los_Angeles')).toEqual({ year: 2026, month: 7, day: 1 });
  });

  it('does calendar arithmetic across months and leap days', () => {
    expect(addDays({ year: 2028, month: 2, day: 28 }, 1)).toEqual({
      year: 2028,
      month: 2,
      day: 29,
    });
    expect(addDays({ year: 2026, month: 12, day: 31 }, 1)).toEqual({
      year: 2027,
      month: 1,
      day: 1,
    });
    expect(weekday({ year: 2026, month: 10, day: 31 })).toBe(6); // Saturday
  });

  it('parses ISO dates strictly', () => {
    expect(parseIsoDate('2026-02-28')).toEqual({ year: 2026, month: 2, day: 28 });
    expect(parseIsoDate('2026-02-30')).toBeNull();
    expect(parseIsoDate('26-2-3')).toBeNull();
  });

  it('formats times of day', () => {
    expect(formatMinuteOfDay(0)).toBe('12:00 AM');
    expect(formatMinuteOfDay(9 * 60 + 30)).toBe('9:30 AM');
    expect(formatMinuteOfDay(12 * 60)).toBe('12:00 PM');
    expect(formatMinuteOfDay(17 * 60)).toBe('5:00 PM');
  });
});
