import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const tones = [
  'bg-secondary text-secondary-foreground',
  'bg-accent text-accent-foreground',
  'bg-ball text-ball-foreground',
];

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
}

export function TrainerAvatar({
  name,
  image,
  className,
}: {
  name: string;
  image?: string | null;
  className?: string;
}) {
  const tone = tones[name.length % tones.length];
  return (
    <Avatar size="lg" className={cn('size-12', className)}>
      {image && <AvatarImage src={image} alt="" />}
      <AvatarFallback className={cn('font-heading font-semibold', tone)}>
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
