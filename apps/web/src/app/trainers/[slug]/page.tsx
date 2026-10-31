import { formatCents, specialtyLabel } from '@heel/core';
import { Award, Cat, Clock, Dog, Languages, MapPin } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { BookingWidget } from '@/components/bookings/booking-widget';
import { TrainerAvatar } from '@/components/trainers/trainer-avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDb, getSession } from '@/lib/auth/server';
import { openSlots } from '@/server/bookings';
import { getCachedTrainer } from '@/server/cached';
import { listPets } from '@/server/pets';
import type { PublicTrainer } from '@/server/trainers';

export async function generateMetadata({
  params,
}: PageProps<'/trainers/[slug]'>): Promise<Metadata> {
  const trainer = await getCachedTrainer((await params).slug);
  if (!trainer) return { title: 'Trainer not found' };
  return {
    title: `${trainer.name}, pet trainer`,
    description: `${trainer.headline}. Book a 1:1 video consult from ${formatCents(trainer.price30Cents)}.`,
  };
}

export default function TrainerPage({ params }: PageProps<'/trainers/[slug]'>) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <Suspense fallback={<p className="text-muted-foreground">Loading trainer…</p>}>
        <Trainer params={params} />
      </Suspense>
    </div>
  );
}

async function Trainer({ params }: { params: PageProps<'/trainers/[slug]'>['params'] }) {
  const trainer = await getCachedTrainer((await params).slug);
  if (!trainer) notFound();

  const facts = [
    { icon: MapPin, text: trainer.city },
    { icon: Clock, text: `Works in ${trainer.timezone.replaceAll('_', ' ')} time` },
    { icon: Languages, text: trainer.languages.join(', ') },
    { icon: Award, text: `${trainer.yearsExperience} years training pets` },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="flex items-center gap-4">
          <TrainerAvatar name={trainer.name} image={trainer.image} className="size-20 text-xl" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{trainer.name}</h1>
            {trainer.credentials && <p className="text-muted-foreground">{trainer.credentials}</p>}
          </div>
        </div>
        <p className="mt-6 font-heading text-xl font-semibold text-balance">{trainer.headline}</p>
        <p className="mt-3 whitespace-pre-line text-muted-foreground">{trainer.bio}</p>

        <h2 className="mt-8 text-lg font-semibold">Specialties</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {trainer.specialties.map((s) => (
            <Badge key={s} variant="secondary" className="h-7 px-3 text-sm">
              {specialtyLabel(s)}
            </Badge>
          ))}
        </div>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {facts.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-2 text-sm">
              <Icon className="size-4 text-primary" aria-hidden="true" />
              {text}
            </li>
          ))}
          <li className="flex items-center gap-2 text-sm">
            {trainer.species.includes('dog') && (
              <Dog className="size-4 text-primary" aria-hidden="true" />
            )}
            {trainer.species.includes('cat') && (
              <Cat className="size-4 text-primary" aria-hidden="true" />
            )}
            Works with {trainer.species.map((s) => (s === 'dog' ? 'dogs' : 'cats')).join(' and ')}
          </li>
        </ul>
      </div>

      <Card className="h-fit lg:sticky lg:top-24">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Book a video consult</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Suspense fallback={<div className="h-72 animate-pulse rounded-xl bg-muted" />}>
            <Booking trainer={trainer} />
          </Suspense>
          <p className="text-center text-xs text-muted-foreground">
            <Link href="/trainers" className="hover:underline">
              See other trainers
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

async function Booking({ trainer }: { trainer: PublicTrainer }) {
  await connection(); // open times depend on the current time and on other bookings
  const db = getDb();
  const now = new Date();
  const [slots30, slots60, session] = await Promise.all([
    openSlots(db, trainer, 30, now, 14),
    openSlots(db, trainer, 60, now, 14),
    getSession(),
  ]);
  const role = session?.user.role;
  const viewer =
    role === 'owner'
      ? {
          kind: 'owner' as const,
          pets: (await listPets(db, session!.user.id)).map(({ id, name }) => ({ id, name })),
        }
      : role
        ? { kind: 'trainer' as const }
        : { kind: 'guest' as const };

  return (
    <BookingWidget
      trainerSlug={trainer.slug}
      prices={{ 30: trainer.price30Cents, 60: trainer.price60Cents }}
      slots={{ 30: slots30.map((s) => s.toISOString()), 60: slots60.map((s) => s.toISOString()) }}
      viewer={viewer}
    />
  );
}
