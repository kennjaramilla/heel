import { formatCents } from '@heel/core';
import {
  Bone,
  CalendarCheck,
  Cat,
  CheckCircle2,
  ClipboardList,
  Dog,
  HeartHandshake,
  Home as HomeIcon,
  Search,
  ShieldCheck,
  Timer,
  Video,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { sampleTrainers, type SampleTrainer } from '@/lib/sample-trainers';

const toneClasses: Record<SampleTrainer['tone'], string> = {
  green: 'bg-secondary text-secondary-foreground',
  amber: 'bg-accent text-accent-foreground',
  peach: 'bg-peach/30 text-foreground',
};

const specialties = [
  { icon: Dog, label: 'Puppy basics', body: 'Potty training, biting, sleeping through the night.' },
  { icon: Bone, label: 'Leash pulling', body: 'Calm walks without the tug-of-war.' },
  {
    icon: HeartHandshake,
    label: 'Reactivity',
    body: 'Barking and lunging at dogs, people or bikes.',
  },
  { icon: HomeIcon, label: 'Separation anxiety', body: 'A pet who panics when you leave.' },
  { icon: Timer, label: 'Recall', body: 'Coming back the first time you call.' },
  { icon: Cat, label: 'Cat behaviour', body: 'Scratching, litter box and multi-cat homes.' },
];

const steps = [
  {
    icon: Search,
    title: 'Find a trainer',
    body: 'Filter by specialty, dog or cat, price, and who is free this week.',
  },
  {
    icon: CalendarCheck,
    title: 'Book a consult',
    body: 'Pick a time shown in your time zone and pay securely. Your slot is held while you check out.',
  },
  {
    icon: Video,
    title: 'Meet on video',
    body: 'Join from your booking page, show the trainer the problem, and ask anything.',
  },
  {
    icon: ClipboardList,
    title: 'Get a training plan',
    body: 'Your trainer sends written homework for the next few weeks after the call.',
  },
];

const faqs = [
  {
    q: 'What happens in a consult?',
    a: "You'll talk through the problem, show the trainer your pet on camera, and practise a first exercise together. Most consults are 30 or 60 minutes.",
  },
  {
    q: 'What if I need to cancel?',
    a: "Cancel more than 24 hours ahead for a full refund, or within 24 hours for a 50% refund. If the trainer cancels, you're always refunded in full.",
  },
  {
    q: 'Do you help with cats?',
    a: 'Yes. Filter by species to find trainers who specialise in cat behaviour.',
  },
  {
    q: 'What do I need for the video call?',
    a: 'A phone or laptop with a camera, and enough space to show your pet. No app to install.',
  },
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -right-32 size-[28rem] rounded-full bg-accent/70 blur-3xl"
        />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <Badge variant="secondary" className="h-7 px-3 text-sm">
              <Video aria-hidden="true" /> 1:1 video consults
            </Badge>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance sm:text-6xl">
              Expert help for your pet, <span className="text-primary">from home.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Book a certified trainer for the leash pulling, the barking at the door, or the puppy
              who won&apos;t settle. Consults from {formatCents(2500)}.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="#trainers">Find a trainer</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#how-it-works">How it works</Link>
              </Button>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {['Certified trainers', 'Dogs and cats', 'Refunds if plans change'].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <BookingPreview />
        </div>
      </section>

      <section id="specialties" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading
          eyebrow="Specialties"
          title="Whatever your pet is up to"
          body="Trainers list what they're best at, so you can find the right match fast."
        />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {specialties.map(({ icon: Icon, label, body }) => (
            <li
              key={label}
              className="flex gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-semibold">{label}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section id="trainers" className="bg-muted/60">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <SectionHeading
            eyebrow="Trainers"
            title="Meet a few of our trainers"
            body="Every trainer sets their own hours and price. Times always show in your time zone."
          />
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {sampleTrainers.map((t) => (
              <li key={t.name}>
                <TrainerCard trainer={t} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading eyebrow="How it works" title="From problem to plan in four steps" />
        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="relative rounded-2xl border border-border bg-card p-6">
              <span className="font-heading text-sm font-semibold text-primary">Step {i + 1}</span>
              <Icon className="mt-3 size-6 text-amber" aria-hidden="true" />
              <h3 className="mt-3 text-lg font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="for-trainers" className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <div className="grid gap-8 overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground md:grid-cols-[1.2fr_1fr] md:p-12">
          <div>
            <p className="font-heading text-sm font-semibold tracking-wide uppercase opacity-80">
              For trainers
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-balance">
              Your schedule, your price, paid out after every session.
            </h2>
            <p className="mt-3 max-w-md opacity-85">
              Set your weekly hours once. Owners book open slots, and your payout is released when
              the consult is done.
            </p>
            <Button size="lg" variant="secondary" className="mt-6" asChild>
              <Link href="/sign-up?role=trainer">Become a trainer</Link>
            </Button>
          </div>
          <ul className="grid content-center gap-4">
            {[
              { icon: CalendarCheck, text: 'Weekly hours in your own time zone' },
              { icon: Wallet, text: 'Keep 85% of every booking, paid via Stripe' },
              { icon: ShieldCheck, text: 'No double bookings, ever' },
            ].map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-3 rounded-2xl bg-primary-foreground/10 p-4"
              >
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                <span className="font-medium">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="faq" className="mx-auto w-full max-w-3xl px-4 pb-20 sm:px-6">
        <SectionHeading eyebrow="FAQ" title="Questions owners ask" />
        <Accordion type="single" collapsible className="mt-8">
          {faqs.map((f) => (
            <AccordionItem key={f.q} value={f.q}>
              <AccordionTrigger className="text-base">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </>
  );
}

function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="font-heading text-sm font-semibold tracking-wide text-primary uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">{title}</h2>
      {body && <p className="mt-3 text-muted-foreground">{body}</p>}
    </div>
  );
}

function TrainerCard({ trainer }: { trainer: SampleTrainer }) {
  return (
    <Card className="h-full">
      <CardHeader className="flex items-center gap-3">
        <Avatar size="lg" className="size-12">
          <AvatarFallback className={cn('font-heading font-semibold', toneClasses[trainer.tone])}>
            {trainer.initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-heading text-base font-semibold">{trainer.name}</p>
          <p className="truncate text-sm text-muted-foreground">
            {trainer.credential} · {trainer.city}
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap gap-1.5">
          {trainer.specialties.map((s) => (
            <Badge key={s} variant="outline">
              {s}
            </Badge>
          ))}
        </div>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          {trainer.species.includes('dog') && <Dog className="size-4" aria-label="Dogs" />}
          {trainer.species.includes('cat') && <Cat className="size-4" aria-label="Cats" />}
          Next available:{' '}
          <span className="font-medium text-foreground">{trainer.nextAvailable}</span>
        </p>
      </CardContent>
      <CardFooter className="justify-between border-t bg-muted/40 py-3">
        <span className="text-sm">
          <span className="font-heading text-lg font-semibold">
            {formatCents(trainer.priceCents)}
          </span>{' '}
          <span className="text-muted-foreground">/ 60 min</span>
        </span>
        <Button size="sm" asChild>
          <Link href="#trainers">View times</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function BookingPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md" aria-label="Example booking">
      <Card className="rotate-1 shadow-xl shadow-primary/10">
        <CardHeader className="flex items-center justify-between">
          <p className="font-heading font-semibold">Upcoming consult</p>
          <Badge>Confirmed</Badge>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center gap-3 rounded-xl bg-muted p-3">
            <span className="flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Dog className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-semibold">Mochi</p>
              <p className="text-sm text-muted-foreground">Shiba Inu · 8 months · Leash pulling</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarFallback className="bg-secondary font-semibold text-secondary-foreground">
                SR
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">with Sam Rivera</p>
              <p className="text-sm text-muted-foreground">Tue, 7:00 PM your time · 60 min</p>
            </div>
          </div>
          <Button className="w-full" disabled>
            <Video aria-hidden="true" /> Join opens 10 minutes before
          </Button>
        </CardContent>
      </Card>
      <div className="absolute -bottom-6 -left-4 flex -rotate-2 items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-lg sm:-left-10">
        <ClipboardList className="size-5 text-amber" aria-hidden="true" />
        <span className="text-sm font-medium">Training plan sent</span>
      </div>
    </div>
  );
}
