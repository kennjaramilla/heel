import { z } from 'zod';
import { addDays, parseIsoDate, toIsoDate, weekday, zonedDate, zonedTimeToUtc } from './time';

export const SLOT_STEP_MINUTES = 30;
export const MIN_NOTICE_MINUTES = 12 * 60; // owners can't book a trainer less than 12 hours ahead
export const BOOKING_WINDOW_DAYS = 28;

const halfHour = (max: number) =>
  z.coerce
    .number()
    .int()
    .min(0)
    .max(max)
    .refine((m) => m % SLOT_STEP_MINUTES === 0, 'Use half-hour steps');

export const availabilityRule = z
  .object({
    weekday: z.coerce.number().int().min(0).max(6), // 0 = Sunday
    startMinute: halfHour(1410),
    endMinute: halfHour(1440),
  })
  .refine((r) => r.endMinute > r.startMinute, {
    message: 'End must be after start',
    path: ['endMinute'],
  });

export type AvailabilityRule = z.infer<typeof availabilityRule>;

export const availabilityInput = z
  .object({
    rules: z.array(availabilityRule).max(28),
    blockedDates: z
      .array(z.string().refine((d) => parseIsoDate(d) !== null, 'Use YYYY-MM-DD'))
      .max(60)
      .transform((dates) => [...new Set(dates)].sort()),
  })
  .refine((a) => !hasOverlap(a.rules), {
    message: 'Two time ranges on the same day overlap',
    path: ['rules'],
  });

export type AvailabilityInput = z.infer<typeof availabilityInput>;

function hasOverlap(rules: AvailabilityRule[]) {
  const sorted = [...rules].sort((a, b) => a.weekday - b.weekday || a.startMinute - b.startMinute);
  return sorted.some((r, i) => {
    const prev = sorted[i - 1];
    return prev?.weekday === r.weekday && r.startMinute < prev.endMinute;
  });
}

export type Interval = { start: Date; end: Date };

export type SlotQuery = {
  rules: AvailabilityRule[];
  blockedDates: string[];
  timeZone: string; // the trainer's zone; rules are in their wall-clock time
  lengthMinutes: number;
  now: Date;
  days?: number;
  busy?: Interval[]; // existing bookings and holds
  minNoticeMinutes?: number;
};

/** Every bookable start time, as UTC instants, for the next `days` days of the trainer's calendar. */
export function generateSlots({
  rules,
  blockedDates,
  timeZone,
  lengthMinutes,
  now,
  days = BOOKING_WINDOW_DAYS,
  busy = [],
  minNoticeMinutes = MIN_NOTICE_MINUTES,
}: SlotQuery): Date[] {
  const earliest = now.getTime() + minNoticeMinutes * 60_000;
  const blocked = new Set(blockedDates);
  const slots = new Map<number, Date>();
  const first = zonedDate(now, timeZone);

  for (let i = 0; i <= days; i++) {
    const date = addDays(first, i);
    if (blocked.has(toIsoDate(date))) continue;
    const dayRules = rules.filter((r) => r.weekday === weekday(date));
    for (const rule of dayRules) {
      for (let m = rule.startMinute; m + lengthMinutes <= rule.endMinute; m += SLOT_STEP_MINUTES) {
        const start = zonedTimeToUtc(date, m, timeZone);
        if (!start || start.getTime() < earliest) continue;
        const end = new Date(start.getTime() + lengthMinutes * 60_000);
        if (busy.some((b) => start < b.end && b.start < end)) continue;
        slots.set(start.getTime(), start);
      }
    }
  }
  return [...slots.values()].sort((a, b) => a.getTime() - b.getTime());
}
