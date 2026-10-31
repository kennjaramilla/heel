import { PAGE_SIZE, slugify, type TrainerProfileInput, type TrainerSearch } from '@heel/core';
import type { Db } from '@heel/db';
import { schema } from '@heel/db';
import {
  and,
  arrayContains,
  arrayOverlaps,
  asc,
  count,
  desc,
  eq,
  ilike,
  like,
  lte,
  or,
  type SQL,
} from 'drizzle-orm';

const { trainerProfile, user } = schema;

export type TrainerProfile = typeof trainerProfile.$inferSelect;
export type PublicTrainer = TrainerProfile & { name: string; image: string | null };

export async function getTrainerProfile(db: Db, userId: string) {
  const [row] = await db.select().from(trainerProfile).where(eq(trainerProfile.userId, userId));
  return row ?? null;
}

/** Creates or updates the signed-in trainer's own profile. The slug is set once, from their name. */
export async function saveTrainerProfile(
  db: Db,
  owner: { id: string; name: string },
  input: TrainerProfileInput,
) {
  const existing = await getTrainerProfile(db, owner.id);
  if (existing) {
    const [row] = await db
      .update(trainerProfile)
      .set(input)
      .where(eq(trainerProfile.userId, owner.id))
      .returning();
    return row!;
  }
  const slug = await uniqueSlug(db, slugify(owner.name));
  const [row] = await db
    .insert(trainerProfile)
    .values({ ...input, userId: owner.id, slug })
    .returning();
  return row!;
}

async function uniqueSlug(db: Db, base: string) {
  const taken = new Set(
    (
      await db
        .select({ slug: trainerProfile.slug })
        .from(trainerProfile)
        .where(or(eq(trainerProfile.slug, base), like(trainerProfile.slug, `${base}-%`)))
    ).map((r) => r.slug),
  );
  if (!taken.has(base)) return base;
  for (let n = 2; ; n++) {
    if (!taken.has(`${base}-${n}`)) return `${base}-${n}`;
  }
}

export async function getPublishedTrainerBySlug(
  db: Db,
  slug: string,
): Promise<PublicTrainer | null> {
  const [row] = await db
    .select({ profile: trainerProfile, name: user.name, image: user.image })
    .from(trainerProfile)
    .innerJoin(user, eq(user.id, trainerProfile.userId))
    .where(and(eq(trainerProfile.slug, slug), eq(trainerProfile.published, true)));
  return row ? { ...row.profile, name: row.name, image: row.image } : null;
}

export async function listPublishedTrainers(db: Db, limit = 24): Promise<PublicTrainer[]> {
  const rows = await db
    .select({ profile: trainerProfile, name: user.name, image: user.image })
    .from(trainerProfile)
    .innerJoin(user, eq(user.id, trainerProfile.userId))
    .where(eq(trainerProfile.published, true))
    .orderBy(desc(trainerProfile.yearsExperience))
    .limit(limit);
  return rows.map((r) => ({ ...r.profile, name: r.name, image: r.image }));
}

/** Escapes % and _ so a search for "100%" doesn't match everything. */
function escapeLike(text: string) {
  return text.replace(/[\\%_]/g, (c) => `\\${c}`);
}

export async function searchTrainers(db: Db, search: TrainerSearch) {
  const filters: SQL[] = [eq(trainerProfile.published, true)];
  if (search.q) {
    const pattern = `%${escapeLike(search.q)}%`;
    filters.push(
      or(
        ilike(user.name, pattern),
        ilike(trainerProfile.headline, pattern),
        ilike(trainerProfile.bio, pattern),
        ilike(trainerProfile.city, pattern),
      )!,
    );
  }
  if (search.species) filters.push(arrayContains(trainerProfile.species, [search.species]));
  if (search.specialty.length)
    filters.push(arrayOverlaps(trainerProfile.specialties, search.specialty));
  if (search.language) filters.push(arrayContains(trainerProfile.languages, [search.language]));
  if (search.maxPrice) filters.push(lte(trainerProfile.price60Cents, search.maxPrice * 100));
  const where = and(...filters);

  const orderBy = {
    recommended: [desc(trainerProfile.yearsExperience), asc(trainerProfile.slug)],
    'price-asc': [asc(trainerProfile.price60Cents), asc(trainerProfile.slug)],
    'price-desc': [desc(trainerProfile.price60Cents), asc(trainerProfile.slug)],
    experience: [desc(trainerProfile.yearsExperience), asc(trainerProfile.slug)],
  }[search.sort];

  const [rows, [{ total } = { total: 0 }]] = await Promise.all([
    db
      .select({ profile: trainerProfile, name: user.name, image: user.image })
      .from(trainerProfile)
      .innerJoin(user, eq(user.id, trainerProfile.userId))
      .where(where)
      .orderBy(...orderBy)
      .limit(PAGE_SIZE)
      .offset((search.page - 1) * PAGE_SIZE),
    db
      .select({ total: count() })
      .from(trainerProfile)
      .innerJoin(user, eq(user.id, trainerProfile.userId))
      .where(where),
  ]);

  return {
    trainers: rows.map((r): PublicTrainer => ({ ...r.profile, name: r.name, image: r.image })),
    total,
    page: search.page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}
