import { Logo } from '@/components/logo';

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <Logo />
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Expert help for the dog pulling on the leash and the cat ignoring the litter box.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Payments run in test mode. No real money moves.
        </p>
      </div>
    </footer>
  );
}
