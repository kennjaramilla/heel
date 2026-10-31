import Link from 'next/link';
import { AuthNav } from '@/components/auth/auth-nav';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';

const nav = [
  { href: '/trainers', label: 'Find a trainer' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#for-trainers', label: 'For trainers' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Button key={item.href} variant="ghost" asChild>
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>
        <AuthNav />
      </div>
    </header>
  );
}
