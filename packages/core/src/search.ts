import { z } from 'zod';
import { LANGUAGES, SPECIALTY_IDS, SPECIES } from './catalog';

export const SORTS = ['recommended', 'price-asc', 'price-desc', 'experience'] as const;
export type Sort = (typeof SORTS)[number];
export const PAGE_SIZE = 12;

// Bad or unknown values are dropped rather than failing the whole page, so a shared link always works.
const optional = <T extends z.ZodType>(schema: T) => schema.optional().catch(undefined);
const many = <T extends z.ZodType>(schema: T) =>
  z
    .union([schema, z.array(z.unknown())])
    .transform((v) => (Array.isArray(v) ? v : [v]))
    .pipe(z.array(z.unknown()))
    .transform((v) => v.filter((x): x is z.infer<T> => schema.safeParse(x).success))
    .catch([]);

export const trainerSearch = z.object({
  q: optional(
    z
      .string()
      .trim()
      .max(80)
      .transform((s) => s || undefined),
  ),
  species: optional(z.enum(SPECIES)),
  specialty: many(z.enum(SPECIALTY_IDS)).default([]),
  language: optional(z.enum(LANGUAGES)),
  maxPrice: optional(z.coerce.number().int().min(10).max(500)), // dollars, 60-minute price
  sort: z.enum(SORTS).catch('recommended').default('recommended'),
  page: z.coerce.number().int().min(1).max(500).catch(1).default(1),
});

export type TrainerSearch = z.infer<typeof trainerSearch>;

export function parseTrainerSearch(params: Record<string, string | string[] | undefined>) {
  return trainerSearch.parse(params);
}

/** Builds the query string for a search, leaving out defaults so URLs stay short. */
export function trainerSearchToParams(search: Partial<TrainerSearch>) {
  const params = new URLSearchParams();
  if (search.q) params.set('q', search.q);
  if (search.species) params.set('species', search.species);
  for (const s of search.specialty ?? []) params.append('specialty', s);
  if (search.language) params.set('language', search.language);
  if (search.maxPrice) params.set('maxPrice', String(search.maxPrice));
  if (search.sort && search.sort !== 'recommended') params.set('sort', search.sort);
  if (search.page && search.page > 1) params.set('page', String(search.page));
  return params;
}
