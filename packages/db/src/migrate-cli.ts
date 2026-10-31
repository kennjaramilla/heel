import { createDb } from './client';
import { migrate } from './migrate';

// On Vercel a missing DATABASE_URL is a setup mistake; fail the build instead of migrating a throwaway PGlite.
if (process.env.VERCEL && !process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Connect a Neon database to this Vercel project.');
  process.exit(1);
}

// Schema changes go over Neon's direct connection, not the connection pooler.
const db = createDb(process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL);
await migrate(db);
console.log(process.env.DATABASE_URL ? 'Migrated Postgres.' : 'Migrated local PGlite.');
process.exit(0);
