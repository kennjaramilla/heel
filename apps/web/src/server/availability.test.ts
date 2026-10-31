import { schema } from '@heel/db';
import { createTestDb } from '@heel/db/testing';
import { describe, expect, it } from 'vitest';
import { getAvailability, saveAvailability } from './availability';

async function setup() {
  const db = await createTestDb();
  await db.insert(schema.user).values([
    { id: 't1', name: 'T1', email: 't1@example.com', role: 'trainer' },
    { id: 't2', name: 'T2', email: 't2@example.com', role: 'trainer' },
  ]);
  return db;
}

describe('availability', () => {
  it('replaces rules and days off, and keeps trainers separate', async () => {
    const db = await setup();
    await saveAvailability(db, 't1', {
      rules: [{ weekday: 1, startMinute: 540, endMinute: 1020 }],
      blockedDates: ['2026-12-25'],
    });
    await saveAvailability(db, 't2', {
      rules: [{ weekday: 3, startMinute: 600, endMinute: 660 }],
      blockedDates: [],
    });
    await saveAvailability(db, 't1', {
      rules: [
        { weekday: 2, startMinute: 600, endMinute: 720 },
        { weekday: 2, startMinute: 780, endMinute: 900 },
      ],
      blockedDates: ['2026-12-31'],
    });

    expect(await getAvailability(db, 't1')).toEqual({
      rules: [
        { weekday: 2, startMinute: 600, endMinute: 720 },
        { weekday: 2, startMinute: 780, endMinute: 900 },
      ],
      blockedDates: ['2026-12-31'],
    });
    expect((await getAvailability(db, 't2')).rules).toHaveLength(1);
  });

  it('rolls back everything if one row is invalid', async () => {
    const db = await setup();
    await saveAvailability(db, 't1', {
      rules: [{ weekday: 1, startMinute: 540, endMinute: 600 }],
      blockedDates: [],
    });
    await expect(
      saveAvailability(db, 't1', {
        rules: [{ weekday: 9, startMinute: 540, endMinute: 600 }],
        blockedDates: [],
      }),
    ).rejects.toThrow();
    expect((await getAvailability(db, 't1')).rules).toEqual([
      { weekday: 1, startMinute: 540, endMinute: 600 },
    ]);
  });
});
