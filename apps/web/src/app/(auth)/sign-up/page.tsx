import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SignUpForm } from '@/components/auth/sign-up-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = { title: 'Create an account' };

export default function SignUpPage() {
  return (
    <Card className="shadow-xl shadow-primary/5">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Join Heel</CardTitle>
        <CardDescription>Book a trainer for your pet, or offer your own consults.</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense>
          <SignUpForm />
        </Suspense>
      </CardContent>
    </Card>
  );
}
