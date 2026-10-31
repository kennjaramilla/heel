import { formatCents } from '@heel/core';

const steps = [
  {
    title: 'Find a trainer',
    body: 'Filter by specialty, species, price and who is free this week.',
  },
  {
    title: 'Book a consult',
    body: 'Pick a time in your own time zone and pay securely. Your slot is held while you check out.',
  },
  {
    title: 'Meet on video',
    body: 'Join the call from the booking page, then get a written training plan for your pet.',
  },
];

const specialties = [
  'Puppy basics',
  'Leash pulling',
  'Reactivity',
  'Separation anxiety',
  'Recall',
  'Cat behaviour',
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
        <span className="text-xl font-semibold tracking-tight">
          <span aria-hidden="true">🐾 </span>Heel
        </span>
        <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
          Demo project
        </span>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 sm:px-6">
        <section className="py-14 sm:py-20">
          <p className="text-sm font-medium text-brand">
            1:1 video consults with certified trainers
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Book a pet trainer in minutes.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted">
            Pulling on the leash, barking at the door, a new puppy who won&apos;t settle: get expert
            help from home, from {formatCents(2500)} a session.
          </p>
          <ul className="mt-8 flex flex-wrap gap-2" aria-label="Popular specialties">
            {specialties.map((s) => (
              <li
                key={s}
                className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm"
              >
                {s}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="how-it-works" className="pb-20">
          <h2 id="how-it-works" className="text-2xl font-semibold tracking-tight">
            How it works
          </h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step.title} className="rounded-2xl border border-border bg-surface p-5">
                <span className="flex size-8 items-center justify-center rounded-full bg-brand text-sm font-semibold text-brand-foreground">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="border-t border-border">
        <p className="mx-auto max-w-5xl px-4 py-6 text-sm text-muted sm:px-6">
          Heel is a portfolio project. Payments run in Stripe test mode; no real money moves.
        </p>
      </footer>
    </div>
  );
}
