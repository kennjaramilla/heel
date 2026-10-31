import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { btree_gist } from '@electric-sql/pglite/contrib/btree_gist';
import { drizzle as drizzlePg, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { Pool } from 'pg';
import * as schema from './schema';

export type Db = NodePgDatabase<typeof schema>;

/** Neon/Postgres in deployed environments; an embedded PGlite file locally when DATABASE_URL is unset. */
export function createDb(url = process.env.DATABASE_URL): Db {
  if (url) {
    return drizzlePg(new Pool({ connectionString: url, max: 5 }), { schema });
  }
  // PGlite speaks the same SQL; the query builder API matches node-postgres.
  const dir = localDataDir();
  mkdirSync(dir, { recursive: true });
  return drizzlePglite(new PGlite(dir, { extensions: { btree_gist } }), {
    schema,
  }) as unknown as Db;
}

/** `<repo root>/.data/pglite`, so the migrate script and the Next dev server share one database. */
export function localDataDir() {
  if (process.env.PGLITE_DIR) return process.env.PGLITE_DIR;
  let dir = process.cwd();
  while (!existsSync(join(dir, 'pnpm-workspace.yaml')) && dirname(dir) !== dir) dir = dirname(dir);
  return join(dir, '.data', 'pglite');
}
