'use server';

import { petInput } from '@heel/core';
import { redirect } from 'next/navigation';
import { getDb, requireUser } from '@/lib/auth/server';
import { createPet, deletePet, updatePet } from '@/server/pets';

export type PetFormState = {
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function savePet(_prev: PetFormState, form: FormData): Promise<PetFormState> {
  const owner = await requireUser(['owner']);
  const parsed = petInput.safeParse({
    name: form.get('name'),
    species: form.get('species'),
    breed: form.get('breed') ?? '',
    bornOn: form.get('bornOn') ?? '',
    concerns: form.getAll('concerns'),
    notes: form.get('notes') ?? '',
  });
  if (!parsed.success) {
    return {
      message: 'Check the highlighted fields.',
      fieldErrors: parsed.error.flatten().fieldErrors as PetFormState['fieldErrors'],
    };
  }

  const id = form.get('id');
  const db = getDb();
  if (typeof id === 'string' && id) {
    const updated = await updatePet(db, owner.id, id, parsed.data);
    if (!updated) return { message: 'That pet could not be found.' };
  } else {
    await createPet(db, owner.id, parsed.data);
  }
  redirect('/dashboard/pets');
}

export async function removePet(id: string) {
  const owner = await requireUser(['owner']);
  await deletePet(getDb(), owner.id, id);
  redirect('/dashboard/pets');
}
