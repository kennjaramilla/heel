import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ProfileForm } from '@/components/profile/profile-form';
import { getDb, requireUser } from '@/lib/auth/server';
import { getTrainerProfile } from '@/server/trainers';

export const metadata: Metadata = { title: 'Your trainer profile' };

export default function ProfilePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Your trainer profile</h1>
      <p className="mt-1 text-muted-foreground">This is what owners see before they book you.</p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-muted-foreground">Loading your profile…</p>}>
          <Profile />
        </Suspense>
      </div>
    </div>
  );
}

async function Profile() {
  const trainer = await requireUser(['trainer']);
  const profile = await getTrainerProfile(getDb(), trainer.id);
  return <ProfileForm profile={profile} timeZones={Intl.supportedValuesOf('timeZone')} />;
}
