import type { TrainerProfileInput } from '@heel/core';
import { schema } from '@heel/db';
import { createTestDb } from '@heel/db/testing';
import { describe, expect, it } from 'vitest';
import {
  getPublishedTrainerBySlug,
  getTrainerProfile,
  listPublishedTrainers,
  saveTrainerProfile,
} from './trainers';

const input: TrainerProfileInput = {
  headline: 'Calm walks for big, excited dogs',
  bio: 'Ten years of helping owners turn chaotic walks into calm ones with positive methods.',
  credentials: 'CPDT-KA',
  city: 'Austin, TX',
  timezone: 'America/Chicago',
  yearsExperience: 10,
  species: ['dog'],
  specialties: ['leash-pulling'],
  languages: ['English'],
  price30Cents: 2500,
  price60Cents: 4500,
  published: true,
};

async function withTrainers(...names: string[]) {
  const db = await createTestDb();
  const users = names.map((name, i) => ({
    id: `t${i}`,
    name,
    email: `t${i}@example.com`,
    role: 'trainer' as const,
  }));
  await db.insert(schema.user).values(users);
  return { db, users };
}

describe('saveTrainerProfile', () => {
  it('creates a profile with a slug from the name, then updates it in place', async () => {
    const { db, users } = await withTrainers('Ana Dela Cruz');
    const created = await saveTrainerProfile(db, users[0]!, input);
    expect(created.slug).toBe('ana-dela-cruz');

    const updated = await saveTrainerProfile(db, users[0]!, { ...input, price60Cents: 5000 });
    expect(updated.slug).toBe('ana-dela-cruz');
    expect((await getTrainerProfile(db, 't0'))?.price60Cents).toBe(5000);
  });

  it('adds a number when two trainers share a name', async () => {
    const { db, users } = await withTrainers('Sam Lee', 'Sam Lee', 'Sam Lee');
    const slugs = [];
    for (const u of users) slugs.push((await saveTrainerProfile(db, u, input)).slug);
    expect(slugs).toEqual(['sam-lee', 'sam-lee-2', 'sam-lee-3']);
  });

  it('lets the database reject prices outside the allowed range', async () => {
    const { db, users } = await withTrainers('Low Price');
    await expect(
      saveTrainerProfile(db, users[0]!, { ...input, price30Cents: 100 }),
    ).rejects.toThrow();
  });
});

describe('public trainer reads', () => {
  it('only show published profiles', async () => {
    const { db, users } = await withTrainers('Public Pat', 'Draft Dana');
    await saveTrainerProfile(db, users[0]!, input);
    await saveTrainerProfile(db, users[1]!, { ...input, published: false });

    expect((await listPublishedTrainers(db)).map((t) => t.name)).toEqual(['Public Pat']);
    expect(await getPublishedTrainerBySlug(db, 'draft-dana')).toBeNull();
    expect((await getPublishedTrainerBySlug(db, 'public-pat'))?.name).toBe('Public Pat');
  });
});
