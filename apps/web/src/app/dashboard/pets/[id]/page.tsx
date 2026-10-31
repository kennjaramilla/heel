import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { PetForm } from '@/components/pets/pet-form';
import { RemovePetButton } from '@/components/pets/remove-pet-button';
import { getDb, requireUser } from '@/lib/auth/server';
import { getPet } from '@/server/pets';

export const metadata: Metadata = { title: 'Edit pet' };

export default function EditPetPage({ params }: PageProps<'/dashboard/pets/[id]'>) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
        <EditPet params={params} />
      </Suspense>
    </div>
  );
}

async function EditPet({ params }: { params: PageProps<'/dashboard/pets/[id]'>['params'] }) {
  const owner = await requireUser(['owner']);
  const pet = await getPet(getDb(), owner.id, (await params).id);
  if (!pet) notFound();

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Edit {pet.name}</h1>
        <RemovePetButton id={pet.id} name={pet.name} />
      </div>
      <div className="mt-8">
        <PetForm pet={pet} />
      </div>
    </>
  );
}
