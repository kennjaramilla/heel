import { describe, expect, it } from 'vitest';
import { formatPetAge, petInput } from './pet';

const now = new Date(Date.UTC(2026, 9, 15)); // 15 Oct 2026

describe('formatPetAge', () => {
  it('reads naturally for puppies, adults and in-between ages', () => {
    expect(formatPetAge('2026-02', now)).toBe('8 months');
    expect(formatPetAge('2025-10', now)).toBe('1 year');
    expect(formatPetAge('2023-08', now)).toBe('3 years 2 months');
    expect(formatPetAge('2022-09', now)).toBe('4 years 1 month');
    expect(formatPetAge('2026-10', now)).toBe('Under 2 months');
  });

  it('returns null for missing or future dates', () => {
    expect(formatPetAge(null, now)).toBeNull();
    expect(formatPetAge('2027-01', now)).toBeNull();
  });
});

describe('petInput', () => {
  it('accepts a month or nothing for the birth date', () => {
    expect(petInput.parse({ name: 'Mochi', species: 'dog', bornOn: '2026-02' }).bornOn).toBe(
      '2026-02',
    );
    expect(petInput.parse({ name: 'Mochi', species: 'dog', bornOn: '' }).bornOn).toBeUndefined();
  });

  it('rejects unknown species and concerns', () => {
    expect(petInput.safeParse({ name: 'Rex', species: 'lizard' }).success).toBe(false);
    expect(
      petInput.safeParse({ name: 'Rex', species: 'dog', concerns: ['juggling'] }).success,
    ).toBe(false);
  });
});
