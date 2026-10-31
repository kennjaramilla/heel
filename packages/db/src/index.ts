// Runtime entry for apps. Migrations live in ./migrate (CLI and tests only), so app bundles never touch the drizzle/ folder.
export { createDb, type Db } from './client';
export * as schema from './schema';
