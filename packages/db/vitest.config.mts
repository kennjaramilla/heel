import { defineConfig } from 'vitest/config';

// Each test boots an in-memory Postgres, which is slow on CI runners.
export default defineConfig({ test: { testTimeout: 30_000 } });
