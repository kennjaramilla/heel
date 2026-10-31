import 'server-only';
import { createDb, type Db } from '@heel/db';
import type { UserRole } from '@heel/db/schema';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createAuth, type Auth } from './config';

// Kept on globalThis so dev hot reloads reuse one connection (two PGlite instances on one folder crash).
// Created on first use, so builds and static pages never open a database connection.
const globals = globalThis as typeof globalThis & { heelDb?: Db; heelAuth?: Auth };

export function getDb() {
  globals.heelDb ??= createDb();
  return globals.heelDb;
}

export function getAuth() {
  globals.heelAuth ??= createAuth(getDb());
  return globals.heelAuth;
}

export async function getSession() {
  // Read the request first: during prerendering this suspends, so auth is never created at build time.
  const requestHeaders = await headers();
  return getAuth().api.getSession({ headers: requestHeaders });
}

/** For pages and actions: returns the signed-in user or redirects. Pass roles to restrict access. */
export async function requireUser(roles?: UserRole[]) {
  const session = await getSession();
  if (!session) redirect('/sign-in');
  const role = session.user.role as UserRole;
  if (roles && !roles.includes(role)) redirect('/dashboard');
  return { ...session.user, role };
}
