import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SignInForm } from '@/components/auth/sign-in-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '@/lib/demo';

export const metadata: Metadata = { title: 'Sign in' };

export default function SignInPage() {
  return (
    <Card className="shadow-xl shadow-primary/5">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription>Sign in to see your consults.</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense>
          <SignInForm />
        </Suspense>
        <div className="mt-6 rounded-xl bg-muted p-4 text-sm">
          <p className="font-medium">Try the demo</p>
          <ul className="mt-2 grid gap-1 text-muted-foreground">
            {DEMO_ACCOUNTS.map((a) => (
              <li key={a.email}>
                {a.role}: <span className="font-mono text-foreground">{a.email}</span>
              </li>
            ))}
            <li>
              Password: <span className="font-mono text-foreground">{DEMO_PASSWORD}</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
