/** Cron callers (Vercel Cron, the GitHub Actions schedule) send CRON_SECRET as a bearer token. */
export function isCronRequest(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && request.headers.get('authorization') === `Bearer ${secret}`;
}
