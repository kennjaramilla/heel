import { formatCents, specialtyLabel } from '@heel/core';
import { Cat, Dog } from 'lucide-react';
import Link from 'next/link';
import { TrainerAvatar } from '@/components/trainers/trainer-avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import type { PublicTrainer } from '@/server/trainers';

export function TrainerCard({ trainer }: { trainer: PublicTrainer }) {
  const href = `/trainers/${trainer.slug}`;
  return (
    <Card className="h-full transition-shadow hover:shadow-lg hover:shadow-primary/5">
      <CardHeader className="flex items-center gap-3">
        <TrainerAvatar name={trainer.name} image={trainer.image} />
        <div className="min-w-0">
          <Link href={href} className="font-heading text-base font-semibold hover:underline">
            {trainer.name}
          </Link>
          <p className="truncate text-sm text-muted-foreground">
            {[trainer.credentials, trainer.city].filter(Boolean).join(' · ')}
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <p className="line-clamp-2 text-sm">{trainer.headline}</p>
        <div className="flex flex-wrap gap-1.5">
          {trainer.specialties.slice(0, 3).map((s) => (
            <Badge key={s} variant="outline">
              {specialtyLabel(s)}
            </Badge>
          ))}
        </div>
        <p className="mt-auto flex items-center gap-2 text-sm text-muted-foreground">
          {trainer.species.includes('dog') && <Dog className="size-4" aria-label="Dogs" />}
          {trainer.species.includes('cat') && <Cat className="size-4" aria-label="Cats" />}
          {trainer.yearsExperience} yrs experience
        </p>
      </CardContent>
      <CardFooter className="justify-between border-t bg-muted/40 py-3">
        <span className="text-sm">
          <span className="font-heading text-lg font-semibold">
            {formatCents(trainer.price60Cents)}
          </span>{' '}
          <span className="text-muted-foreground">/ 60 min</span>
        </span>
        <Button size="sm" asChild>
          <Link href={href}>View profile</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
