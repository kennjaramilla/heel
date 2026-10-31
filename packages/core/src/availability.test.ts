import { describe, expect, it } from 'vitest';
import { availabilityInput, generateSlots } from './availability';

const weekdays9to12 = [1, 2, 3, 4, 5].map((weekday) => ({
  weekday,
  startMinute: 540,
  endMinute: 720,
}));
const iso = (dates: Date[]) => dates.map((d) => d.toISOString());

describe('availabilityInput', () => {
  it('accepts half-hour ranges and sorts and dedupes blocked dates', () => {
    const parsed = availabilityInput.parse({
      rules: [{ weekday: '1', startMinute: '540', endMinute: '1020' }],
      blockedDates: ['2026-12-25', '2026-12-24', '2026-12-25'],
    });
    expect(parsed.rules[0]).toEqual({ weekday: 1, startMinute: 540, endMinute: 1020 });
    expect(parsed.blockedDates).toEqual(['2026-12-24', '2026-12-25']);
  });

  it('rejects overlaps, backwards ranges and odd minutes', () => {
    const bad = (rules: unknown) =>
      availabilityInput.safeParse({ rules, blockedDates: [] }).success;
    expect(
      bad([
        { weekday: 1, startMinute: 540, endMinute: 720 },
        { weekday: 1, startMinute: 690, endMinute: 800 },
      ]),
    ).toBe(false);
    expect(bad([{ weekday: 1, startMinute: 720, endMinute: 540 }])).toBe(false);
    expect(bad([{ weekday: 1, startMinute: 545, endMinute: 720 }])).toBe(false);
    // Back-to-back ranges are fine.
    expect(
      bad([
        { weekday: 1, startMinute: 540, endMinute: 720 },
        { weekday: 1, startMinute: 720, endMinute: 780 },
      ]),
    ).toBe(true);
  });
});

describe('generateSlots', () => {
  // Sunday 1 Nov 2026, 12:00 UTC.
  const now = new Date('2026-11-01T12:00:00Z');

  it("returns start times in the trainer's zone as UTC instants", () => {
    const slots = generateSlots({
      rules: weekdays9to12,
      blockedDates: [],
      timeZone: 'Asia/Manila',
      lengthMinutes: 60,
      now,
      days: 1,
    });
    // Monday 2 Nov, 9:00–12:00 Manila = 01:00–04:00 UTC; 60-minute consults every 30 minutes.
    expect(iso(slots)).toEqual([
      '2026-11-02T01:00:00.000Z',
      '2026-11-02T01:30:00.000Z',
      '2026-11-02T02:00:00.000Z',
      '2026-11-02T02:30:00.000Z',
      '2026-11-02T03:00:00.000Z',
    ]);
  });

  it('respects minimum notice, blocked dates and existing bookings', () => {
    const base = { rules: weekdays9to12, timeZone: 'Asia/Manila', lengthMinutes: 60, now, days: 2 };
    expect(
      generateSlots({ ...base, blockedDates: ['2026-11-02'] }).every((s) =>
        s.toISOString().startsWith('2026-11-03'),
      ),
    ).toBe(true);

    const busy = [
      { start: new Date('2026-11-02T02:00:00Z'), end: new Date('2026-11-02T03:00:00Z') },
    ];
    const monday = generateSlots({ ...base, blockedDates: [], busy, days: 1 });
    expect(iso(monday)).toEqual(['2026-11-02T01:00:00.000Z', '2026-11-02T03:00:00.000Z']);

    const soon = generateSlots({
      ...base,
      blockedDates: [],
      days: 1,
      now: new Date('2026-11-01T15:00:00Z'),
    });
    expect(soon[0]?.toISOString()).toBe('2026-11-02T03:00:00.000Z'); // 12 hours' notice
  });

  it('keeps wall-clock hours across a daylight-saving change', () => {
    const rules = [{ weekday: 0, startMinute: 540, endMinute: 600 }]; // Sundays 9–10 AM
    const slots = generateSlots({
      rules,
      blockedDates: [],
      timeZone: 'America/New_York',
      lengthMinutes: 60,
      now: new Date('2026-10-20T00:00:00Z'),
      days: 14,
      minNoticeMinutes: 0,
    });
    // 25 Oct is EDT (UTC-4), 1 Nov is EST (UTC-5): same 9 AM, different UTC time.
    expect(iso(slots)).toEqual(['2026-10-25T13:00:00.000Z', '2026-11-01T14:00:00.000Z']);
  });

  it('skips times that do not exist on the spring-forward day', () => {
    const rules = [{ weekday: 0, startMinute: 120, endMinute: 240 }]; // Sundays 2–4 AM
    const slots = generateSlots({
      rules,
      blockedDates: [],
      timeZone: 'America/New_York',
      lengthMinutes: 30,
      now: new Date('2026-03-07T00:00:00Z'),
      days: 2,
      minNoticeMinutes: 0,
    });
    // 2:00 and 2:30 AM don't exist on 8 March; 3:00 and 3:30 do.
    expect(iso(slots)).toEqual(['2026-03-08T07:00:00.000Z', '2026-03-08T07:30:00.000Z']);
  });
});
