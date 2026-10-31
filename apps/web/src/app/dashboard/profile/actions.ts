'use server';

import { trainerProfileInput } from '@heel/core';
import { updateTag } from 'next/cache';
import { getDb, requireUser } from '@/lib/auth/server';
import { saveTrainerProfile } from '@/server/trainers';

export type ProfileFormState = {
  status: 'idle' | 'saved' | 'error';
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  slug?: string;
};

function dollarsToCents(value: FormDataEntryValue | null) {
  const n = Number(String(value ?? '').replace(/[$,\s]/g, ''));
  return Number.isFinite(n) ? Math.round(n * 100) : NaN;
}

export async function saveProfile(
  _prev: ProfileFormState,
  form: FormData,
): Promise<ProfileFormState> {
  const trainer = await requireUser(['trainer']);

  const parsed = trainerProfileInput.safeParse({
    headline: form.get('headline'),
    bio: form.get('bio'),
    credentials: form.get('credentials') ?? '',
    city: form.get('city'),
    timezone: form.get('timezone'),
    yearsExperience: form.get('yearsExperience'),
    species: form.getAll('species'),
    specialties: form.getAll('specialties'),
    languages: form.getAll('languages'),
    price30Cents: dollarsToCents(form.get('price30')),
    price60Cents: dollarsToCents(form.get('price60')),
    published: form.get('published') === 'on',
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as ProfileFormState['fieldErrors'];
    return { status: 'error', message: 'Check the highlighted fields.', fieldErrors };
  }

  const profile = await saveTrainerProfile(getDb(), trainer, parsed.data);
  updateTag('trainers');
  updateTag(`trainer:${profile.slug}`);
  return {
    status: 'saved',
    message: profile.published ? 'Saved. Your profile is live.' : 'Saved as a draft.',
    slug: profile.slug,
  };
}
