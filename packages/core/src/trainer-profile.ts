import { z } from 'zod';
import { LANGUAGES, SPECIALTY_IDS, SPECIES } from './catalog';

const MIN_PRICE = 1000; // $10
const MAX_PRICE = 50000; // $500

const price = z.coerce
  .number()
  .int('Use whole cents')
  .min(MIN_PRICE, 'At least $10')
  .max(MAX_PRICE, 'At most $500');

export const trainerProfileInput = z
  .object({
    headline: z.string().trim().min(10, 'At least 10 characters').max(120),
    bio: z.string().trim().min(40, 'Tell owners a bit more (40+ characters)').max(2000),
    credentials: z.string().trim().max(120).default(''),
    city: z.string().trim().min(2).max(80),
    timezone: z.string().refine(isValidTimeZone, 'Pick a valid time zone'),
    yearsExperience: z.coerce.number().int().min(0).max(60),
    species: z.array(z.enum(SPECIES)).min(1, 'Pick dogs, cats or both'),
    specialties: z.array(z.enum(SPECIALTY_IDS)).min(1, 'Pick at least one specialty').max(5),
    languages: z.array(z.enum(LANGUAGES)).min(1, 'Pick at least one language'),
    price30Cents: price,
    price60Cents: price,
    published: z.boolean().default(false),
  })
  .refine((p) => p.price60Cents >= p.price30Cents, {
    message: 'A 60-minute consult should cost at least as much as 30 minutes',
    path: ['price60Cents'],
  });

export type TrainerProfileInput = z.infer<typeof trainerProfileInput>;

export function isValidTimeZone(tz: string) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return tz.includes('/') || tz === 'UTC';
  } catch {
    return false;
  }
}

/** "Ana Dela Cruz" -> "ana-dela-cruz"; the caller adds a suffix if it's taken. */
export function slugify(name: string) {
  return (
    name
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'trainer'
  );
}
