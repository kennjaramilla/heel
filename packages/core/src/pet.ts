import { z } from 'zod';
import { SPECIALTY_IDS, SPECIES } from './catalog';

export const petInput = z.object({
  name: z.string().trim().min(1, 'Your pet needs a name').max(40),
  species: z.enum(SPECIES),
  breed: z.string().trim().max(60).default(''),
  // <input type="month"> sends "YYYY-MM"; stored as the first day of that month.
  bornOn: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Pick a month')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  concerns: z.array(z.enum(SPECIALTY_IDS)).max(5).default([]),
  notes: z.string().trim().max(1000).default(''),
});

export type PetInput = z.infer<typeof petInput>;

/** "8 months", "1 year", "3 years 2 months". Returns null for future or missing dates. */
export function formatPetAge(bornOn: string | null | undefined, now = new Date()) {
  if (!bornOn) return null;
  const [y, m] = bornOn.split('-').map(Number);
  if (!y || !m) return null;
  const months = (now.getUTCFullYear() - y) * 12 + (now.getUTCMonth() + 1 - m);
  if (months < 0) return null;
  if (months < 12) return months <= 1 ? 'Under 2 months' : `${months} months`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const yearText = years === 1 ? '1 year' : `${years} years`;
  return rest ? `${yearText} ${rest} month${rest === 1 ? '' : 's'}` : yearText;
}
