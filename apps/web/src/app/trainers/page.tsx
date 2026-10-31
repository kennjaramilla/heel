import type { Metadata } from 'next';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { TrainerCard } from '@/components/trainers/trainer-card';
import { getCachedTrainers } from '@/server/cached';

export const metadata: Metadata = {
  title: 'Find a pet trainer',
  description: 'Browse certified dog and cat trainers offering 1:1 video consults.',
};

export default function TrainersPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Find a trainer</h1>
      <p className="mt-2 text-muted-foreground">
        Every trainer sets their own hours and price. Times always show in your time zone.
      </p>
      <Suspense fallback={<p className="mt-8 text-muted-foreground">Loading trainers…</p>}>
        <TrainerGrid />
      </Suspense>
    </div>
  );
}

async function TrainerGrid() {
  await connection(); // read the database at request time, never during the build
  const trainers = await getCachedTrainers(48);
  if (trainers.length === 0) {
    return (
      <p className="mt-8 text-muted-foreground">No trainers are listed yet. Check back soon.</p>
    );
  }
  return (
    <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {trainers.map((t) => (
        <li key={t.userId}>
          <TrainerCard trainer={t} />
        </li>
      ))}
    </ul>
  );
}
