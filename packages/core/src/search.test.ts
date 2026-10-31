import { describe, expect, it } from 'vitest';
import { parseTrainerSearch, trainerSearchToParams } from './search';

describe('parseTrainerSearch', () => {
  it('reads valid filters from the URL', () => {
    expect(
      parseTrainerSearch({
        q: ' leash ',
        species: 'dog',
        specialty: ['reactivity', 'recall'],
        language: 'Cebuano',
        maxPrice: '1500',
        sort: 'price-asc',
        page: '2',
      }),
    ).toEqual({
      q: 'leash',
      species: 'dog',
      specialty: ['reactivity', 'recall'],
      language: 'Cebuano',
      maxPrice: 1500,
      sort: 'price-asc',
      page: 2,
    });
  });

  it('accepts a single specialty as a string', () => {
    expect(parseTrainerSearch({ specialty: 'recall' }).specialty).toEqual(['recall']);
  });

  it('drops bad values instead of failing, so old or edited links still work', () => {
    expect(
      parseTrainerSearch({
        species: 'lizard',
        specialty: ['recall', 'juggling'],
        maxPrice: 'cheap',
        sort: 'random',
        page: '-3',
        q: '',
      }),
    ).toEqual({ specialty: ['recall'], sort: 'recommended', page: 1 });
  });
});

describe('trainerSearchToParams', () => {
  it('round-trips and leaves out defaults', () => {
    const search = parseTrainerSearch({
      species: 'cat',
      specialty: ['litter-box'],
      sort: 'recommended',
      page: '1',
    });
    expect(trainerSearchToParams(search).toString()).toBe('species=cat&specialty=litter-box');
  });
});
