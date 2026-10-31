import { fileURLToPath } from 'node:url';
import { migrate as migratePg } from 'drizzle-orm/node-postgres/migrator';
import type { Db } from './client';

export const migrationsFolder = fileURLToPath(new URL('../drizzle', import.meta.url));

// The node-postgres and PGlite migrators run the same SQL files the same way.
export async function migrate(db: Db) {
  await migratePg(db, { migrationsFolder });
}
