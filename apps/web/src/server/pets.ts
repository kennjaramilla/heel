import type { PetInput } from '@heel/core';
import type { Db } from '@heel/db';
import { schema } from '@heel/db';
import { and, asc, eq } from 'drizzle-orm';

const { pet } = schema;

export type Pet = Omit<typeof pet.$inferSelect, 'bornOn'> & { bornOn: string | null }; // "YYYY-MM"

// Every query is scoped to the owner, so one owner can never read or change another owner's pet.
const owned = (ownerId: string, id: string) => and(eq(pet.id, id), eq(pet.ownerId, ownerId));

function toRow(input: PetInput) {
  return { ...input, bornOn: input.bornOn ? `${input.bornOn}-01` : null };
}

function fromRow(row: typeof pet.$inferSelect): Pet {
  return { ...row, bornOn: row.bornOn ? row.bornOn.slice(0, 7) : null };
}

export async function listPets(db: Db, ownerId: string) {
  const rows = await db
    .select()
    .from(pet)
    .where(eq(pet.ownerId, ownerId))
    .orderBy(asc(pet.createdAt));
  return rows.map(fromRow);
}

export async function getPet(db: Db, ownerId: string, id: string) {
  const [row] = await db.select().from(pet).where(owned(ownerId, id));
  return row ? fromRow(row) : null;
}

export async function createPet(db: Db, ownerId: string, input: PetInput) {
  const [row] = await db
    .insert(pet)
    .values({ id: crypto.randomUUID(), ownerId, ...toRow(input) })
    .returning();
  return fromRow(row!);
}

/** Returns null when the pet doesn't exist or belongs to someone else. */
export async function updatePet(db: Db, ownerId: string, id: string, input: PetInput) {
  const [row] = await db.update(pet).set(toRow(input)).where(owned(ownerId, id)).returning();
  return row ? fromRow(row) : null;
}

export async function deletePet(db: Db, ownerId: string, id: string) {
  const rows = await db.delete(pet).where(owned(ownerId, id)).returning({ id: pet.id });
  return rows.length > 0;
}
