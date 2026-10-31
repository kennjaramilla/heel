'use client';

import { LANGUAGES, SPECIALTIES, type TrainerSearch, trainerSearchToParams } from '@heel/core';
import { Search, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const PRICE_OPTIONS = [30, 40, 50, 75];
const SORT_LABELS: Record<TrainerSearch['sort'], string> = {
  recommended: 'Recommended',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
  experience: 'Most experienced',
};

/**
 * A plain GET form, so filtering works without JavaScript. With JavaScript, changes apply instantly
 * and update the URL, which makes every search shareable.
 */
export function TrainerFilters({ search }: { search: TrainerSearch }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  function apply() {
    const form = new FormData(formRef.current!);
    const params = trainerSearchToParams({
      q: String(form.get('q') ?? '').trim() || undefined,
      species: (form.get('species') || undefined) as TrainerSearch['species'],
      specialty: form.getAll('specialty') as TrainerSearch['specialty'],
      language: (form.get('language') || undefined) as TrainerSearch['language'],
      maxPrice: Number(form.get('maxPrice')) || undefined,
      sort: (form.get('sort') || 'recommended') as TrainerSearch['sort'],
    });
    const qs = params.toString();
    startTransition(() => router.replace(qs ? `/trainers?${qs}` : '/trainers', { scroll: false }));
  }

  return (
    <form
      ref={formRef}
      action="/trainers"
      method="get"
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
      onChange={(e) => {
        if ((e.target as HTMLElement).getAttribute('name') !== 'q') apply();
      }}
      aria-busy={pending}
      className={cn('grid gap-6 transition-opacity', pending && 'opacity-60')}
    >
      <div className="relative">
        <Label htmlFor="q" className="sr-only">
          Search trainers
        </Label>
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="q"
          name="q"
          type="search"
          defaultValue={search.q}
          placeholder="Name, city or problem"
          className="h-10 pl-9"
        />
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">Pet</legend>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: '', label: 'Any' },
            { value: 'dog', label: 'Dogs' },
            { value: 'cat', label: 'Cats' },
          ].map((o) => (
            <Chip
              key={o.value}
              type="radio"
              name="species"
              value={o.value}
              defaultChecked={(search.species ?? '') === o.value}
            >
              {o.label}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">Specialty</legend>
        <div className="flex flex-wrap gap-2">
          {SPECIALTIES.map((s) => (
            <Chip
              key={s.id}
              type="checkbox"
              name="specialty"
              value={s.id}
              defaultChecked={search.specialty.includes(s.id)}
            >
              {s.label}
            </Chip>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <Select label="Language" name="language" defaultValue={search.language ?? ''}>
          <option value="">Any language</option>
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </Select>
        <Select
          label="Max price (60 min)"
          name="maxPrice"
          defaultValue={String(search.maxPrice ?? '')}
        >
          <option value="">Any price</option>
          {PRICE_OPTIONS.map((p) => (
            <option key={p} value={p}>
              Up to ${p}
            </option>
          ))}
        </Select>
        <Select label="Sort by" name="sort" defaultValue={search.sort}>
          {Object.entries(SORT_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          <SlidersHorizontal aria-hidden="true" /> Apply
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/trainers">Clear</Link>
        </Button>
      </div>
    </form>
  );
}

function Chip({
  children,
  ...input
}: React.InputHTMLAttributes<HTMLInputElement> & { children: React.ReactNode }) {
  return (
    <label className="cursor-pointer rounded-full border border-border bg-card px-3 py-1.5 text-center text-sm transition-colors has-checked:border-primary has-checked:bg-secondary has-checked:text-secondary-foreground has-focus-visible:ring-3 has-focus-visible:ring-ring/50">
      <input {...input} className="sr-only" />
      {children}
    </label>
  );
}

function Select({
  label,
  name,
  defaultValue,
  children,
}: {
  label: string;
  name: string;
  defaultValue: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm"
      >
        {children}
      </select>
    </div>
  );
}
