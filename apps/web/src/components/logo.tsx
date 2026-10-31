import { PawPrint } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 font-heading text-xl font-bold tracking-tight"
    >
      <span className="flex size-8 items-center justify-center rounded-xl bg-ball text-ball-foreground">
        <PawPrint className="size-4.5" aria-hidden="true" />
      </span>
      Heel
    </Link>
  );
}
