'use client';

import {
  type AvailabilityInput,
  type AvailabilityRule,
  formatMinuteOfDay,
  SLOT_STEP_MINUTES,
} from '@heel/core';
import { CalendarOff, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { type AvailabilityFormState, saveHours } from '@/app/dashboard/availability/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFormAction } from '@/lib/use-form-action';
import { cn } from '@/lib/utils';

const DAYS = [
  { weekday: 1, label: 'Monday' },
  { weekday: 2, label: 'Tuesday' },
  { weekday: 3, label: 'Wednesday' },
  { weekday: 4, label: 'Thursday' },
  { weekday: 5, label: 'Friday' },
  { weekday: 6, label: 'Saturday' },
  { weekday: 0, label: 'Sunday' },
];
const TIMES = Array.from({ length: 1440 / SLOT_STEP_MINUTES + 1 }, (_, i) => i * SLOT_STEP_MINUTES);
const initialState: AvailabilityFormState = { status: 'idle' };

export function HoursEditor({
  initial,
  timeZone,
}: {
  initial: AvailabilityInput;
  timeZone: string;
}) {
  const [rules, setRules] = useState<AvailabilityRule[]>(initial.rules);
  const [blocked, setBlocked] = useState<string[]>(initial.blockedDates);
  const [newDate, setNewDate] = useState('');
  const [state, onSubmit, pending] = useFormAction(saveHours, initialState);

  const update = (index: number, patch: Partial<AvailabilityRule>) =>
    setRules((rs) => rs.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  function addRange(weekday: number) {
    const last = rules.filter((r) => r.weekday === weekday).at(-1);
    const start = last ? Math.min(last.endMinute + 60, 1380) : 540;
    setRules((rs) => [
      ...rs,
      { weekday, startMinute: start, endMinute: Math.min(start + 180, 1440) },
    ]);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8">
      <input
        type="hidden"
        name="payload"
        value={JSON.stringify({ rules, blockedDates: blocked })}
      />

      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Weekly hours</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          In your time zone,{' '}
          <span className="font-medium text-foreground">{timeZone.replaceAll('_', ' ')}</span>.
          Owners see them converted to their own.
        </p>
        <ul className="mt-6 divide-y divide-border">
          {DAYS.map(({ weekday, label }) => {
            const ranges = rules
              .map((r, index) => ({ r, index }))
              .filter(({ r }) => r.weekday === weekday);
            return (
              <li key={weekday} className="grid gap-3 py-4 sm:grid-cols-[120px_1fr]">
                <span className={cn('pt-2 font-medium', !ranges.length && 'text-muted-foreground')}>
                  {label}
                </span>
                <div className="grid gap-2">
                  {ranges.length === 0 && (
                    <p className="pt-2 text-sm text-muted-foreground">Unavailable</p>
                  )}
                  {ranges.map(({ r, index }) => (
                    <div key={index} className="flex flex-wrap items-center gap-2">
                      <TimeSelect
                        label={`${label} start`}
                        value={r.startMinute}
                        options={TIMES.slice(0, -1)}
                        onChange={(startMinute) => update(index, { startMinute })}
                      />
                      <span className="text-muted-foreground">to</span>
                      <TimeSelect
                        label={`${label} end`}
                        value={r.endMinute}
                        options={TIMES.slice(1)}
                        onChange={(endMinute) => update(index, { endMinute })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove ${label} ${formatMinuteOfDay(r.startMinute)}`}
                        onClick={() => setRules((rs) => rs.filter((_, i) => i !== index))}
                      >
                        <X />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-fit"
                    onClick={() => addRange(weekday)}
                  >
                    <Plus aria-hidden="true" /> Add hours
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Days off</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Holidays or any day you can&apos;t take consults.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Input
            type="date"
            aria-label="Day off"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="w-auto"
          />
          <Button
            type="button"
            variant="outline"
            disabled={!newDate}
            onClick={() => {
              setBlocked((b) => [...new Set([...b, newDate])].sort());
              setNewDate('');
            }}
          >
            <CalendarOff aria-hidden="true" /> Add day off
          </Button>
        </div>
        {blocked.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {blocked.map((d) => (
              <li
                key={d}
                className="flex items-center gap-1 rounded-full bg-muted py-1 pr-1 pl-3 text-sm"
              >
                {new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  timeZone: 'UTC',
                })}
                <button
                  type="button"
                  aria-label={`Remove ${d}`}
                  onClick={() => setBlocked((b) => b.filter((x) => x !== d))}
                  className="rounded-full p-1 hover:bg-background"
                >
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? 'Saving…' : 'Save hours'}
        </Button>
        {state.message && (
          <p
            role="status"
            className={cn(
              'text-sm',
              state.status === 'error' ? 'text-destructive' : 'text-primary',
            )}
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}

function TimeSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: number;
  options: number[];
  onChange: (minute: number) => void;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="h-9 rounded-lg border border-input bg-background px-2 text-sm"
    >
      {options.map((m) => (
        <option key={m} value={m}>
          {m === 1440 ? '12:00 AM (midnight)' : formatMinuteOfDay(m)}
        </option>
      ))}
    </select>
  );
}
