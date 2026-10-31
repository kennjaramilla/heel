import { parseTrainerSearch, type TrainerProfileInput } from '@heel/core';
import { schema } from '@heel/db';
import { createTestDb } from '@heel/db/testing';
import { beforeAll, describe, expect, it } from 'vitest';
import { saveTrainerProfile, searchTrainers } from './trainers';

const base: TrainerProfileInput = {
  headline: 'Helping dogs and owners',
  bio: 'Positive, practical training that fits your schedule and your home.',
  credentials: '',
  city: 'Austin, TX',
  timezone: 'America/Chicago',
  yearsExperience: 5,
  species: ['dog'],
  specialties: ['recall'],
  languages: ['English'],
  price30Cents: 2000,
  price60Cents: 4000,
  published: true,
};

const fixtures: [string, Partial<TrainerProfileInput>][] = [
  [
    'Alex Cat',
    { species: ['cat'], specialties: ['cat-behaviour'], price60Cents: 3000, yearsExperience: 3 },
  ],
  [
    'Bea Both',
    {
      species: ['dog', 'cat'],
      specialties: ['reactivity'],
      languages: ['English', 'Spanish'],
      price60Cents: 6000,
      yearsExperience: 12,
    },
  ],
  [
    'Cy Dog',
    {
      specialties: ['leash-pulling', 'recall'],
      price60Cents: 4500,
      yearsExperience: 8,
      headline: '100% calm walks',
    },
  ],
  ['Dee Draft', { published: false }],
];

let db: Awaited<ReturnType<typeof createTestDb>>;

beforeAll(async () => {
  db = await createTestDb();
  for (const [i, [name, overrides]] of fixtures.entries()) {
    await db
      .insert(schema.user)
      .values({ id: `u${i}`, name, email: `u${i}@example.com`, role: 'trainer' });
    await saveTrainerProfile(db, { id: `u${i}`, name }, { ...base, ...overrides });
  }
});

const names = async (params: Record<string, string | string[]>) =>
  (await searchTrainers(db, parseTrainerSearch(params))).trainers.map((t) => t.name);

describe('searchTrainers', () => {
  it('lists published trainers only, most experienced first', async () => {
    expect(await names({})).toEqual(['Bea Both', 'Cy Dog', 'Alex Cat']);
  });

  it('filters by species, specialty, language and max price', async () => {
    expect(await names({ species: 'cat' })).toEqual(['Bea Both', 'Alex Cat']);
    expect(await names({ specialty: ['reactivity', 'cat-behaviour'] })).toEqual([
      'Bea Both',
      'Alex Cat',
    ]);
    expect(await names({ language: 'Spanish' })).toEqual(['Bea Both']);
    expect(await names({ maxPrice: '45' })).toEqual(['Cy Dog', 'Alex Cat']);
    expect(await names({ species: 'dog', maxPrice: '45' })).toEqual(['Cy Dog']);
  });

  it('searches names and headlines, treating % and _ as plain text', async () => {
    expect(await names({ q: 'bea' })).toEqual(['Bea Both']);
    expect(await names({ q: '100%' })).toEqual(['Cy Dog']);
    expect(await names({ q: '%' })).toEqual(['Cy Dog']);
  });

  it('sorts by price', async () => {
    expect(await names({ sort: 'price-asc' })).toEqual(['Alex Cat', 'Cy Dog', 'Bea Both']);
    expect(await names({ sort: 'price-desc' })).toEqual(['Bea Both', 'Cy Dog', 'Alex Cat']);
  });

  it('reports totals for pagination', async () => {
    const result = await searchTrainers(db, parseTrainerSearch({ page: '2' }));
    expect(result).toMatchObject({ total: 3, page: 2, pageCount: 1, trainers: [] });
  });
});
