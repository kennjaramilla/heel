import type { UserRole } from '@heel/db/schema';
import { CalendarClock, CreditCard, Dog, Search, ShieldCheck, UserRound } from 'lucide-react';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireUser } from '@/lib/auth/server';

export const metadata: Metadata = { title: 'Dashboard' };

const roleLabel: Record<UserRole, string> = {
  owner: 'Pet owner',
  trainer: 'Trainer',
  admin: 'Admin',
};

const nextSteps: Record<UserRole, { icon: typeof Dog; title: string; body: string }[]> = {
  owner: [
    { icon: Dog, title: 'Add your pet', body: 'Name, breed, age and what you need help with.' },
    { icon: Search, title: 'Find a trainer', body: 'Search by specialty and book a time.' },
  ],
  trainer: [
    { icon: UserRound, title: 'Complete your profile', body: 'Bio, specialties and your price.' },
    {
      icon: CalendarClock,
      title: 'Set your weekly hours',
      body: 'Owners can only book open slots.',
    },
    { icon: CreditCard, title: 'Connect payouts', body: 'Get paid after each consult via Stripe.' },
  ],
  admin: [
    { icon: ShieldCheck, title: 'Admin tools', body: 'Users, bookings, refunds and support.' },
  ],
};

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <Suspense fallback={<p className="text-muted-foreground">Loading your dashboard…</p>}>
        <Dashboard />
      </Suspense>
    </div>
  );
}

async function Dashboard() {
  const user = await requireUser();

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge variant="secondary">{roleLabel[user.role]}</Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Hi, {user.name.split(' ')[0]}</h1>
          <p className="mt-1 text-muted-foreground">Here&apos;s what to do next.</p>
        </div>
        <SignOutButton />
      </div>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {nextSteps[user.role].map(({ icon: Icon, title, body }) => (
          <li key={title}>
            <Card className="h-full">
              <CardHeader>
                <Icon className="size-5 text-primary" aria-hidden="true" />
                <CardTitle className="mt-2 text-base font-semibold">{title}</CardTitle>
                <CardDescription>{body}</CardDescription>
              </CardHeader>
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}
