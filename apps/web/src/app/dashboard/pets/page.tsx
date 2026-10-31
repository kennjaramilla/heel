import { formatPetAge, specialtyLabel } from '@heel/core';
import { Cat, Dog, Plus } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { getDb, requireUser } from '@/lib/auth/server';
import { listPets } from '@/server/pets';

export const metadata: Metadata = { title: 'Your pets' };

export default function PetsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your pets</h1>
          <p className="mt-1 text-muted-foreground">Trainers see this before your consult.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/pets/new">
            <Plus aria-hidden="true" /> Add a pet
          </Link>
        </Button>
      </div>
      <Suspense fallback={<p className="mt-8 text-muted-foreground">Loading your pets…</p>}>
        <PetList />
      </Suspense>
    </div>
  );
}

async function PetList() {
  const owner = await requireUser(['owner']);
  const pets = await listPets(getDb(), owner.id);

  if (pets.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-border p-10 text-center">
        <Dog className="mx-auto size-8 text-primary" aria-hidden="true" />
        <p className="mt-3 font-medium">No pets yet</p>
        <p className="text-sm text-muted-foreground">Add your dog or cat to book a consult.</p>
      </div>
    );
  }

  return (
    <ul className="mt-8 grid gap-4 sm:grid-cols-2">
      {pets.map((p) => {
        const Icon = p.species === 'cat' ? Cat : Dog;
        const age = formatPetAge(p.bornOn);
        return (
          <li key={p.id}>
            <Card className="h-full">
              <CardHeader className="flex items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-heading text-lg font-semibold">{p.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {[p.breed, age].filter(Boolean).join(' · ') ||
                      (p.species === 'cat' ? 'Cat' : 'Dog')}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-3">
                {p.concerns.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {p.concerns.map((c) => (
                      <Badge key={c} variant="outline">
                        {specialtyLabel(c)}
                      </Badge>
                    ))}
                  </div>
                )}
                <Button variant="outline" size="sm" className="mt-auto w-fit" asChild>
                  <Link href={`/dashboard/pets/${p.id}`}>Edit</Link>
                </Button>
              </CardContent>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
