import { schema } from '@heel/db';
import { createTestDb } from '@heel/db/testing';
import { describe, expect, it } from 'vitest';
import { createPet, deletePet, getPet, listPets, updatePet } from './pets';

async function twoOwners() {
  const db = await createTestDb();
  await db.insert(schema.user).values([
    { id: 'alice', name: 'Alice', email: 'alice@example.com' },
    { id: 'bob', name: 'Bob', email: 'bob@example.com' },
  ]);
  return db;
}

const mochi = {
  name: 'Mochi',
  species: 'dog' as const,
  breed: 'Shiba Inu',
  bornOn: '2026-02',
  concerns: ['leash-pulling' as const],
  notes: '',
};

describe('pets', () => {
  it('stores the birth month and reads it back the same way', async () => {
    const db = await twoOwners();
    const created = await createPet(db, 'alice', mochi);
    expect(created.bornOn).toBe('2026-02');
    expect((await listPets(db, 'alice')).map((p) => p.name)).toEqual(['Mochi']);
  });

  it("never lets one owner see, edit or delete another owner's pet", async () => {
    const db = await twoOwners();
    const alicesPet = await createPet(db, 'alice', mochi);

    expect(await listPets(db, 'bob')).toEqual([]);
    expect(await getPet(db, 'bob', alicesPet.id)).toBeNull();
    expect(await updatePet(db, 'bob', alicesPet.id, { ...mochi, name: 'Hacked' })).toBeNull();
    expect(await deletePet(db, 'bob', alicesPet.id)).toBe(false);

    expect((await getPet(db, 'alice', alicesPet.id))?.name).toBe('Mochi');
  });

  it('lets the owner update and delete their own pet', async () => {
    const db = await twoOwners();
    const p = await createPet(db, 'alice', mochi);
    expect(
      (await updatePet(db, 'alice', p.id, { ...mochi, bornOn: undefined }))?.bornOn,
    ).toBeNull();
    expect(await deletePet(db, 'alice', p.id)).toBe(true);
    expect(await listPets(db, 'alice')).toEqual([]);
  });
});
