import { defineConfig, devices } from '@playwright/test';

// Runs against a production build with a fresh, seeded local database (PGlite), so CI needs no services.
const PGLITE_DIR = `${process.cwd()}/.data/e2e`;

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false, // one embedded database, one browser at a time
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    timezoneId: 'America/New_York',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `rm -rf ${PGLITE_DIR} && pnpm db:migrate && pnpm db:seed && pnpm --filter @heel/web start`,
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      PGLITE_DIR,
      BETTER_AUTH_SECRET: 'e2e-secret-not-for-production-use',
      RATE_LIMIT: 'off',
      ADMIN_PASSWORD: 'e2e-admin-password',
    },
  },
});
