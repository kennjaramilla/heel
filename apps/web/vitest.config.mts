import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  // Database tests boot an in-memory Postgres and hash passwords, which is slow on CI runners.
  test: { environment: 'node', include: ['src/**/*.test.ts'], testTimeout: 30_000 },
});
