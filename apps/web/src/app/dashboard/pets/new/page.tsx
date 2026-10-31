import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PetForm } from '@/components/pets/pet-form';
import { requireUser } from '@/lib/auth/server';

export const metadata: Metadata = { title: 'Add a pet' };

export default function NewPetPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Add a pet</h1>
      <div className="mt-8">
        <Suspense>
          <OwnerOnly />
        </Suspense>
      </div>
    </div>
  );
}

async function OwnerOnly() {
  await requireUser(['owner']);
  return <PetForm />;
}
