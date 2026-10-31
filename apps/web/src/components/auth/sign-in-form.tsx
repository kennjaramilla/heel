'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { FormError } from '@/components/auth/form-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth/client';
import { safeNext } from '@/lib/safe-next';

export function SignInForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get('next'));
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    const { error } = await authClient.signIn.email({
      email: String(form.get('email')),
      password: String(form.get('password')),
    });
    setPending(false);
    if (error) {
      setError(
        error.status === 401
          ? 'Wrong email or password.'
          : error.status === 403 && error.message
            ? error.message
            : 'Could not sign in. Try again.',
      );
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <FormError message={error} />
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? 'Signing in…' : 'Sign in'}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        New to Heel?{' '}
        <Link href="/sign-up" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
