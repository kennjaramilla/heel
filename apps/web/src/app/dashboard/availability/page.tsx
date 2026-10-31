import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { HoursEditor } from '@/components/availability/hours-editor';
import { Button } from '@/components/ui/button';
import { getDb, requireUser } from '@/lib/auth/server';
import { getAvailability } from '@/server/availability';
import { getTrainerProfile } from '@/server/trainers';

export const metadata: Metadata = { title: 'Your hours' };

export default function AvailabilityPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Your hours</h1>
      <p className="mt-1 text-muted-foreground">Owners can only book times inside these hours.</p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-muted-foreground">Loading your hours…</p>}>
          <Editor />
        </Suspense>
      </div>
    </div>
  );
}

async function Editor() {
  const trainer = await requireUser(['trainer']);
  const db = getDb();
  const [profile, availability] = await Promise.all([
    getTrainerProfile(db, trainer.id),
    getAvailability(db, trainer.id),
  ]);

  if (!profile) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center">
        <p className="font-medium">Set up your profile first</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Your hours use the time zone on your profile.
        </p>
        <Button className="mt-4" asChild>
          <Link href="/dashboard/profile">Complete your profile</Link>
        </Button>
      </div>
    );
  }
  return <HoursEditor initial={availability} timeZone={profile.timezone} />;
}
