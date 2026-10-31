import type { Db } from '@heel/db';
import { schema } from '@heel/db';
import { betterAuth } from 'better-auth';
import { APIError } from 'better-auth/api';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { eq } from 'drizzle-orm';

/** Roles a person can pick at sign-up. Admins are only ever created by a seed or an admin. */
export const SELF_SERVE_ROLES = ['owner', 'trainer'] as const;
export type SelfServeRole = (typeof SELF_SERVE_ROLES)[number];

export function isSelfServeRole(value: unknown): value is SelfServeRole {
  return SELF_SERVE_ROLES.includes(value as SelfServeRole);
}

// Production, this project's Vercel previews, and local dev. Anything else is rejected.
const PRODUCTION_URL = 'https://heel-pets.vercel.app';
const ALLOWED_HOSTS = [
  'heel-pets.vercel.app',
  'heel-*-ken-vercel-062926.vercel.app',
  'localhost:3000',
];

export function createAuth(db: Db) {
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
        rateLimit: schema.rateLimit,
      },
    }),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: { allowedHosts: ALLOWED_HOSTS, fallback: PRODUCTION_URL },
    trustedOrigins: ALLOWED_HOSTS.map((host) =>
      host.startsWith('localhost') ? `http://${host}` : `https://${host}`,
    ),
    emailAndPassword: { enabled: true, minPasswordLength: 8 },
    // Stored in Postgres so limits apply across all serverless instances, not per instance.
    rateLimit: {
      enabled: process.env.NODE_ENV === 'production' || process.env.RATE_LIMIT === 'on',
      storage: 'database',
      window: 60,
      max: 100,
      customRules: {
        '/sign-in/email': { window: 60, max: 5 },
        '/sign-up/email': { window: 300, max: 5 },
      },
    },
    session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
    user: {
      additionalFields: {
        role: { type: 'string', required: false, defaultValue: 'owner', input: true },
      },
    },
    databaseHooks: {
      session: {
        create: {
          // Suspended accounts can't start a session. Their existing sessions are deleted on suspension.
          before: async (session) => {
            const [row] = await db
              .select({ suspendedAt: schema.user.suspendedAt })
              .from(schema.user)
              .where(eq(schema.user.id, session.userId));
            if (row?.suspendedAt) {
              throw new APIError('FORBIDDEN', {
                message: 'This account is suspended. Contact support.',
              });
            }
          },
        },
      },
      user: {
        create: {
          // Never trust the client with roles: anything but owner/trainer becomes owner.
          before: async (user) => ({
            data: { ...user, role: isSelfServeRole(user.role) ? user.role : 'owner' },
          }),
        },
      },
    },
    plugins: [nextCookies()],
  });
}

export type Auth = ReturnType<typeof createAuth>;
