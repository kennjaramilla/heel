import { describe, expect, it } from 'vitest';
import { isValidTimeZone, slugify, trainerProfileInput } from './trainer-profile';

const valid = {
  headline: 'Calm walks for big, excited dogs',
  bio: 'Ten years of helping owners turn chaotic walks into calm ones with positive methods.',
  city: 'Austin, TX',
  timezone: 'America/Chicago',
  yearsExperience: '10',
  species: ['dog'],
  specialties: ['leash-pulling'],
  languages: ['English'],
  price30Cents: '80000',
  price60Cents: '150000',
};

describe('trainerProfileInput', () => {
  it('accepts a complete profile and coerces numbers from form fields', () => {
    const result = trainerProfileInput.parse(valid);
    expect(result.price60Cents).toBe(150000);
    expect(result.yearsExperience).toBe(10);
    expect(result.published).toBe(false);
  });

  it('rejects specialties that are not in the catalog', () => {
    expect(trainerProfileInput.safeParse({ ...valid, specialties: ['parkour'] }).success).toBe(
      false,
    );
  });

  it('rejects a 60-minute price below the 30-minute price', () => {
    const r = trainerProfileInput.safeParse({ ...valid, price60Cents: '50000' });
    expect(r.success).toBe(false);
  });

  it('rejects prices outside ₱300–₱10,000', () => {
    expect(trainerProfileInput.safeParse({ ...valid, price30Cents: '500' }).success).toBe(false);
    expect(trainerProfileInput.safeParse({ ...valid, price60Cents: '2000000' }).success).toBe(
      false,
    );
  });
});

describe('isValidTimeZone', () => {
  it('accepts IANA zones and rejects junk', () => {
    expect(isValidTimeZone('Asia/Manila')).toBe(true);
    expect(isValidTimeZone('UTC')).toBe(true);
    expect(isValidTimeZone('Mars/Olympus')).toBe(false);
    expect(isValidTimeZone('EST5EDT')).toBe(false);
  });
});

describe('slugify', () => {
  it('makes readable URL slugs', () => {
    expect(slugify('Ana Dela Cruz')).toBe('ana-dela-cruz');
    expect(slugify('  Zoë   O’Brien ')).toBe('zoe-o-brien');
    expect(slugify('!!!')).toBe('trainer');
  });
});
