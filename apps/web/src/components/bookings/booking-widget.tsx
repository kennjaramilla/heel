'use client';

import { formatCents } from '@heel/core';
import { CalendarClock } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { holdSlot, type HoldState } from '@/app/bookings/actions';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useFormAction } from '@/lib/use-form-action';
import { useTimeZone } from '@/lib/use-time-zone';
import { cn } from '@/lib/utils';

type Viewer =
  { kind: 'guest' } | { kind: 'trainer' } | { kind: 'owner'; pets: { id: string; name: string }[] };

const initialState: HoldState = {};

export function BookingWidget({
  trainerSlug,
  prices,
  slots,
  viewer,
}: {
  trainerSlug: string;
  prices: { 30: number; 60: number };
  slots: { 30: string[]; 60: string[] };
  viewer: Viewer;
}) {
  const timeZone = useTimeZone();
  const [length, setLength] = useState<30 | 60>(60);
  const [selected, setSelected] = useState<string | null>(null);
  const [daysShown, setDaysShown] = useState(4);
  const [state, onSubmit, pending] = useFormAction(holdSlot, initialState);

  const days = groupByDay(slots[length], timeZone);
  const timeLabel = timeZone
    ? new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', minute: '2-digit' })
    : null;

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <input type="hidden" name="trainerSlug" value={trainerSlug} />
      <input type="hidden" name="lengthMinutes" value={length} />
      <input type="hidden" name="startsAt" value={selected ?? ''} />

      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Consult length">
        {([30, 60] as const).map((l) => (
          <button
            key={l}
            type="button"
            role="radio"
            aria-checked={length === l}
            onClick={() => {
              setLength(l);
              setSelected(null);
            }}
            className={cn(
              'flex items-center justify-between rounded-xl border p-3 text-left text-sm transition-colors',
              length === l
                ? 'border-primary bg-secondary/70'
                : 'border-border bg-muted/60 hover:border-primary/40',
            )}
          >
            <span>{l} min</span>
            <span className="font-heading text-lg font-semibold">{formatCents(prices[l])}</span>
          </button>
        ))}
      </div>

      <div>
        <p className="text-sm font-medium">Pick a time</p>
        {!timeZone ? (
          <div className="mt-3 h-40 animate-pulse rounded-xl bg-muted" aria-hidden="true" />
        ) : days.length === 0 ? (
          <p className="mt-3 flex items-center gap-2 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
            <CalendarClock className="size-4" aria-hidden="true" /> No open times in the next two
            weeks.
          </p>
        ) : (
          <div className="mt-1 grid gap-3">
            <p className="text-xs text-muted-foreground">
              Times in {timeZone.replaceAll('_', ' ')}
            </p>
            {days.slice(0, daysShown).map(({ label, times }) => (
              <fieldset key={label}>
                <legend className="text-sm font-medium">{label}</legend>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {times.map((iso) => (
                    <button
                      key={iso}
                      type="button"
                      aria-pressed={selected === iso}
                      onClick={() => setSelected(iso)}
                      className={cn(
                        'rounded-full px-2.5 py-1 text-xs transition-colors',
                        selected === iso
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-primary/15',
                      )}
                    >
                      {timeLabel!.format(new Date(iso))}
                    </button>
                  ))}
                </div>
              </fieldset>
            ))}
            {days.length > daysShown && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-fit"
                onClick={() => setDaysShown((d) => d + 4)}
              >
                Show more days
              </Button>
            )}
          </div>
        )}
      </div>

      {viewer.kind === 'owner' && viewer.pets.length > 0 && (
        <>
          <div className="grid gap-2">
            <Label htmlFor="petId">For which pet?</Label>
            <select
              id="petId"
              name="petId"
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
              defaultValue={viewer.pets[0]!.id}
            >
              {viewer.pets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="note">Anything the trainer should know? (optional)</Label>
            <textarea
              id="note"
              name="note"
              rows={2}
              maxLength={500}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </>
      )}

      {state.message && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.message}
        </p>
      )}

      {viewer.kind === 'guest' && (
        <Button size="lg" asChild>
          <Link href={`/sign-in?next=${encodeURIComponent(`/trainers/${trainerSlug}`)}`}>
            Sign in to book
          </Link>
        </Button>
      )}
      {viewer.kind === 'trainer' && (
        <p className="text-center text-sm text-muted-foreground">
          Sign in with a pet owner account to book.
        </p>
      )}
      {viewer.kind === 'owner' && viewer.pets.length === 0 && (
        <Button size="lg" variant="outline" asChild>
          <Link href="/dashboard/pets/new">Add your pet to book</Link>
        </Button>
      )}
      {viewer.kind === 'owner' && viewer.pets.length > 0 && (
        <Button type="submit" size="lg" disabled={!selected || pending}>
          {pending
            ? 'Holding your time…'
            : selected
              ? `Continue · ${formatCents(prices[length])}`
              : 'Pick a time'}
        </Button>
      )}
    </form>
  );
}

function groupByDay(slots: string[], timeZone: string | null) {
  if (!timeZone) return [];
  const key = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const label = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const days = new Map<string, { label: string; times: string[] }>();
  for (const iso of slots) {
    const d = new Date(iso);
    const k = key.format(d);
    if (!days.has(k)) days.set(k, { label: label.format(d), times: [] });
    days.get(k)!.times.push(iso);
  }
  return [...days.values()];
}
