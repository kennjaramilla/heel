import { formatCents, specialtyLabel } from '@heel/core';
import { Award, Cat, Clock, Dog, Languages, MapPin } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { TrainerAvatar } from '@/components/trainers/trainer-avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCachedTrainer } from '@/server/cached';

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
          {[
            { label: '30 minutes', cents: trainer.price30Cents },
            { label: '60 minutes', cents: trainer.price60Cents },
          ].map((o) => (
            <div
              key={o.label}
              className="flex items-center justify-between rounded-xl bg-muted p-3"
            >
              <span>{o.label}</span>
              <span className="font-heading text-lg font-semibold">{formatCents(o.cents)}</span>
            </div>
          ))}
          <Button size="lg" disabled>
            Booking opens soon
          </Button>
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
