# Heel

Book a certified pet trainer for a 1:1 video consult.

Heel is a two-sided marketplace: pet owners find trainers, book paid sessions, and meet on video; trainers set their availability and get paid out after each session. It's a portfolio project, so payments run in Stripe test mode.

## Stack

- **Web:** Next.js (App Router) + TypeScript + Tailwind, deployed on Vercel
- **Business rules:** `packages/core`, plain TypeScript shared by the web app and, later, the mobile app
- **Data:** Postgres (Neon) + Drizzle; locally an embedded PGlite database, so no setup is needed
- **Auth:** Better Auth with email and password; roles are pet owner, trainer and admin
- **Tooling:** pnpm workspaces + Turborepo, ESLint, Prettier, Vitest, GitHub Actions

Coming in later PRs: Stripe Connect, Daily video, Inngest reminders, and an Expo mobile app.

## Run it locally

Requires Node 22.

```bash
corepack enable   # or: npm i -g pnpm
pnpm install
pnpm db:migrate   # creates the local database in .data/
pnpm dev          # http://localhost:3000
```

Other scripts: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm format`.

End-to-end tests run the real user journeys (browse, book, pay, cancel, training plans, access rules) against a production build with a fresh seeded database, plus axe accessibility checks and a CSP-violation check on every page:

```bash
pnpm exec playwright install chromium   # once
pnpm build && pnpm e2e
```

## Repo layout

```
apps/web         Next.js app
packages/core    Business rules (money, scheduling, refunds), unit tested
packages/db      Drizzle schema, migrations, and a test helper that spins up Postgres in memory
```
