'use client';

import { LANGUAGES, SPECIALTIES, SPECIES } from '@heel/core';
import Link from 'next/link';
import { useActionState, useEffect, useRef } from 'react';
import { type ProfileFormState, saveProfile } from '@/app/dashboard/profile/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { TrainerProfile } from '@/server/trainers';
import { cn } from '@/lib/utils';

const initialState: ProfileFormState = { status: 'idle' };

export function ProfileForm({
  profile,
  timeZones,
}: {
  profile: TrainerProfile | null;
  timeZones: string[];
}) {
  const [state, action, pending] = useActionState(saveProfile, initialState);
  const timezoneRef = useRef<HTMLSelectElement>(null);
  const errors = state.fieldErrors ?? {};
  const slug = state.slug ?? profile?.slug;

  // New trainers start in their browser's time zone (only known on the client).
  useEffect(() => {
    const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!profile && timezoneRef.current && timeZones.includes(browserTz)) {
      timezoneRef.current.value = browserTz;
    }
  }, [profile, timeZones]);

  return (
    <form action={action} className="grid gap-8">
      <Section title="About you">
        <Field label="Headline" name="headline" error={errors.headline}>
          <Input
            id="headline"
            name="headline"
            defaultValue={profile?.headline}
            placeholder="Calm walks for big, excited dogs"
            maxLength={120}
            required
          />
        </Field>
        <Field
          label="Bio"
          name="bio"
          error={errors.bio}
          hint="What you help with and how you train."
        >
          <textarea
            id="bio"
            name="bio"
            defaultValue={profile?.bio}
            rows={5}
            maxLength={2000}
            required
            className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Credentials" name="credentials" error={errors.credentials}>
            <Input
              id="credentials"
              name="credentials"
              defaultValue={profile?.credentials}
              placeholder="CPDT-KA"
            />
          </Field>
          <Field label="Years of experience" name="yearsExperience" error={errors.yearsExperience}>
            <Input
              id="yearsExperience"
              name="yearsExperience"
              type="number"
              min={0}
              max={60}
              defaultValue={profile?.yearsExperience ?? 1}
              required
            />
          </Field>
          <Field label="City" name="city" error={errors.city}>
            <Input
              id="city"
              name="city"
              defaultValue={profile?.city}
              placeholder="Austin, TX"
              required
            />
          </Field>
          <Field label="Time zone" name="timezone" error={errors.timezone}>
            <select
              id="timezone"
              name="timezone"
              ref={timezoneRef}
              defaultValue={profile?.timezone ?? 'America/New_York'}
              className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
            >
              {timeZones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      <Section title="What you help with">
        <ChipGroup
          legend="Pets"
          name="species"
          error={errors.species}
          options={SPECIES.map((s) => ({ value: s, label: s === 'dog' ? 'Dogs' : 'Cats' }))}
          selected={profile?.species ?? ['dog']}
        />
        <ChipGroup
          legend="Specialties (up to 5)"
          name="specialties"
          error={errors.specialties}
          options={SPECIALTIES.map((s) => ({ value: s.id, label: s.label }))}
          selected={profile?.specialties ?? []}
        />
        <ChipGroup
          legend="Languages"
          name="languages"
          error={errors.languages}
          options={LANGUAGES.map((l) => ({ value: l, label: l }))}
          selected={profile?.languages ?? ['English']}
        />
      </Section>

      <Section title="Prices">
        <div className="grid gap-4 sm:grid-cols-2">
          <PriceField
            label="30-minute consult"
            name="price30"
            error={errors.price30Cents}
            cents={profile?.price30Cents ?? 2500}
          />
          <PriceField
            label="60-minute consult"
            name="price60"
            error={errors.price60Cents}
            cents={profile?.price60Cents ?? 4500}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Heel keeps 15% of each booking; the rest is paid out to you after the consult.
        </p>
      </Section>

      <label className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
        <input
          type="checkbox"
          name="published"
          defaultChecked={profile?.published ?? false}
          className="mt-1 size-4 accent-(--primary)"
        />
        <span>
          <span className="font-medium">Show my profile to owners</span>
          <span className="block text-sm text-muted-foreground">
            Leave this off while you&apos;re still filling things in.
          </span>
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? 'Saving…' : 'Save profile'}
        </Button>
        {slug && (
          <Button variant="outline" size="lg" asChild>
            <Link href={`/trainers/${slug}`}>View public page</Link>
          </Button>
        )}
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  name,
  error,
  hint,
  children,
}: {
  label: string;
  name: string;
  error?: string[];
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2" data-invalid={error ? true : undefined}>
      <Label htmlFor={name}>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error[0]}</p>}
    </div>
  );
}

function PriceField({
  label,
  name,
  error,
  cents,
}: {
  label: string;
  name: string;
  error?: string[];
  cents: number;
}) {
  return (
    <Field label={label} name={name} error={error}>
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
          $
        </span>
        <Input
          id={name}
          name={name}
          inputMode="decimal"
          defaultValue={(cents / 100).toString()}
          className="pl-7"
          required
        />
      </div>
    </Field>
  );
}

function ChipGroup({
  legend,
  name,
  options,
  selected,
  error,
}: {
  legend: string;
  name: string;
  options: { value: string; label: string }[];
  selected: string[];
  error?: string[];
}) {
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-2 text-sm font-medium">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o.value}
            className="cursor-pointer rounded-full border border-border bg-background px-3 py-1.5 text-sm transition-colors has-checked:border-primary has-checked:bg-secondary has-checked:text-secondary-foreground has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
          >
            <input
              type="checkbox"
              name={name}
              value={o.value}
              defaultChecked={selected.includes(o.value)}
              className="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>
      {error && <p className="text-xs text-destructive">{error[0]}</p>}
    </fieldset>
  );
}
