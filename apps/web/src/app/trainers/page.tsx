import { parseTrainerSearch, type TrainerSearch, trainerSearchToParams } from '@heel/core';
import { SearchX } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { TrainerCard } from '@/components/trainers/trainer-card';
import { TrainerFilters } from '@/components/trainers/trainer-filters';
import { Button } from '@/components/ui/button';
import { getCachedSearch } from '@/server/cached';

export const metadata: Metadata = {
  title: 'Find a pet trainer',
  description:
    'Search certified dog and cat trainers by specialty, language and price, then book a video consult.',
};

export default function TrainersPage({ searchParams }: PageProps<'/trainers'>) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Find a trainer</h1>
      <p className="mt-2 text-muted-foreground">
        Every trainer sets their own hours and price. Times always show in your time zone.
      </p>
      <Suspense fallback={<p className="mt-8 text-muted-foreground">Loading trainers…</p>}>
        <Results searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Results({ searchParams }: { searchParams: PageProps<'/trainers'>['searchParams'] }) {
  const search = parseTrainerSearch(await searchParams);
  const { trainers, total, page, pageCount } = await getCachedSearch(search);

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside className="h-fit rounded-2xl border border-border bg-card/60 p-5 lg:sticky lg:top-24">
        {/* Keyed by the URL so the form resets when the user navigates back or clears filters. */}
        <TrainerFilters key={trainerSearchToParams(search).toString()} search={search} />
      </aside>
      <section aria-label="Results">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {total === 1 ? '1 trainer' : `${total} trainers`}
        </p>
        {trainers.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-border p-10 text-center">
            <SearchX className="mx-auto size-8 text-primary" aria-hidden="true" />
            <p className="mt-3 font-medium">No trainers match those filters</p>
            <Button variant="link" asChild>
              <Link href="/trainers">Clear filters</Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {trainers.map((t) => (
              <li key={t.userId}>
                <TrainerCard trainer={t} />
              </li>
            ))}
          </ul>
        )}
        {pageCount > 1 && <Pagination search={search} page={page} pageCount={pageCount} />}
      </section>
    </div>
  );
}

function Pagination({
  search,
  page,
  pageCount,
}: {
  search: TrainerSearch;
  page: number;
  pageCount: number;
}) {
  const href = (p: number) => {
    const qs = trainerSearchToParams({ ...search, page: p }).toString();
    return qs ? `/trainers?${qs}` : '/trainers';
  };
  return (
    <nav aria-label="Pages" className="mt-8 flex items-center justify-between">
      <Button variant="outline" asChild disabled={page <= 1}>
        {page > 1 ? <Link href={href(page - 1)}>Previous</Link> : <span>Previous</span>}
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {page} of {pageCount}
      </span>
      <Button variant="outline" asChild disabled={page >= pageCount}>
        {page < pageCount ? <Link href={href(page + 1)}>Next</Link> : <span>Next</span>}
      </Button>
    </nav>
  );
}
