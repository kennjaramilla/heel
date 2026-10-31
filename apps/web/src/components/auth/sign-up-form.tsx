'use client';

import { Dog, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { FormError } from '@/components/auth/form-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth/client';
import type { SelfServeRole } from '@/lib/auth/config';
import { cn } from '@/lib/utils';

const roles: { value: SelfServeRole; title: string; body: string; icon: typeof Dog }[] = [
  { value: 'owner', title: "I'm a pet owner", body: 'Book consults for my pets', icon: Dog },
  {
    value: 'trainer',
    title: "I'm a trainer",
    body: 'Offer consults and get paid',
    icon: GraduationCap,
  },
];

export function SignUpForm() {
  const router = useRouter();
  const initialRole = useSearchParams().get('role') === 'trainer' ? 'trainer' : 'owner';
  const [role, setRole] = useState<SelfServeRole>(initialRole);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    const { error } = await authClient.signUp.email({
      name: String(form.get('name')).trim(),
      email: String(form.get('email')).trim(),
      password: String(form.get('password')),
      role,
    });
    setPending(false);
    if (error) {
      setError(
        error.code === 'USER_ALREADY_EXISTS'
          ? 'An account with this email already exists.'
          : (error.message ?? 'Could not create your account. Try again.'),
      );
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <fieldset className="grid grid-cols-2 gap-3">
        <legend className="sr-only">Account type</legend>
        {roles.map(({ value, title, body, icon: Icon }) => (
          <label
            key={value}
            className={cn(
              'flex cursor-pointer flex-col gap-2 rounded-xl border bg-card p-3 text-sm transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50',
              role === value
                ? 'border-primary bg-secondary/60'
                : 'border-border hover:border-primary/40',
            )}
          >
            <input
              type="radio"
              name="role"
              value={value}
              checked={role === value}
              onChange={() => setRole(value)}
              className="sr-only"
            />
            <Icon className="size-5 text-primary" aria-hidden="true" />
            <span className="font-semibold">{title}</span>
            <span className="text-muted-foreground">{body}</span>
          </label>
        ))}
      </fieldset>
      <div className="grid gap-2">
        <Label htmlFor="name">Your name</Label>
        <Input id="name" name="name" autoComplete="name" required maxLength={80} />
      </div>
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
          autoComplete="new-password"
          minLength={8}
          required
        />
        <p className="text-xs text-muted-foreground">At least 8 characters.</p>
      </div>
      <FormError message={error} />
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? 'Creating account…' : 'Create account'}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/sign-in" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
