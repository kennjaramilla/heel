import { formatCents, specialtyLabel } from '@heel/core';
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
import { connection } from 'next/server';
import { Suspense } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CatTarget, Fetch, LeashWalk } from '@/components/scenes/mini-scenes';
import { s as scenes } from '@/components/scenes/classes';
import { TrainingYard } from '@/components/scenes/training-yard';
import { TrainerCard } from '@/components/trainers/trainer-card';
import { getCachedTrainers } from '@/server/cached';

const specialties = [
  { icon: Dog, id: 'puppy-basics', body: 'Potty training, biting, sleeping through the night.' },
  { icon: Bone, id: 'leash-pulling', body: 'Calm walks without the tug-of-war.' },
  { icon: HeartHandshake, id: 'reactivity', body: 'Barking and lunging at dogs, people or bikes.' },
  { icon: HomeIcon, id: 'separation-anxiety', body: 'A pet who panics when you leave.' },
  { icon: Timer, id: 'recall', body: 'Coming back the first time you call.' },
  { icon: Cat, id: 'cat-behaviour', body: 'Scratching, litter box and multi-cat homes.' },
] as const;

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
          className="pointer-events-none absolute -top-32 -right-32 size-[28rem] rounded-full bg-secondary blur-3xl"
        />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <Badge className="h-7 bg-ball px-3 text-sm text-ball-foreground">
              <Video aria-hidden="true" /> 1:1 video consults
            </Badge>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance sm:text-6xl">
              Expert help for your pet, from home.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Book a certified trainer for the leash pulling, the barking at the door, or the puppy
              who won&apos;t settle. Consults from {formatCents(70_000)}.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/trainers">Find a trainer</Link>
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

          <HeroScene />
        </div>
      </section>

      <Wins />

      <section id="specialties" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading
          eyebrow="Specialties"
          title="Whatever your pet is up to"
          body="Trainers list what they're best at, so you can find the right match fast."
        />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {specialties.map(({ icon: Icon, id, body }) => (
            <li key={id}>
              <Link
                href={`/trainers?specialty=${id}`}
                className="flex h-full gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-heading font-semibold">{specialtyLabel(id)}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">{body}</span>
                </span>
              </Link>
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
          <Suspense fallback={<TrainerGridSkeleton />}>
            <FeaturedTrainers />
          </Suspense>
          <div className="mt-8">
            <Button variant="outline" size="lg" asChild>
              <Link href="/trainers">See all trainers</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading eyebrow="How it works" title="From problem to plan in four steps" />
        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="relative rounded-2xl border border-border bg-card p-6">
              <span className="font-heading text-sm font-semibold text-primary">Step {i + 1}</span>
              <Icon className="mt-3 size-6 text-pop" aria-hidden="true" />
              <h3 className="mt-3 text-lg font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="for-trainers" className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <div className="grid gap-8 overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground md:grid-cols-[1.2fr_1fr] md:p-12">
          <div>
            <p className="w-fit rounded-full bg-ball px-3 py-1 font-heading text-sm font-semibold text-ball-foreground">
              For trainers
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-balance">
              Your schedule, your price, paid out after every session.
            </h2>
            <p className="mt-3 max-w-md opacity-95">
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
      <p className="font-heading text-sm font-semibold text-primary">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">{title}</h2>
      {body && <p className="mt-3 text-muted-foreground">{body}</p>}
    </div>
  );
}

function HeroScene() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="overflow-hidden rounded-[2rem] border border-border shadow-xl shadow-primary/10">
        <TrainingYard className="block h-auto w-full" />
      </div>
      <div
        className={`${scenes.float} absolute -top-4 right-4 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 shadow-lg`}
      >
        <CalendarCheck className="size-5 text-primary" aria-hidden="true" />
        <span className="text-sm">
          <span className="font-semibold">Mochi</span> with Sam · Tue 7:00 PM
        </span>
      </div>
      <div
        className={`${scenes.float} ${scenes.floatLate} absolute -bottom-5 left-4 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 shadow-lg sm:-left-8`}
      >
        <ClipboardList className="size-5 text-pop" aria-hidden="true" />
        <span className="text-sm font-medium">Training plan sent</span>
      </div>
    </div>
  );
}

const wins = [
  {
    Scene: LeashWalk,
    title: 'Loose-leash walks',
    body: 'Mochi went from pulling to walking at your side in three weeks.',
    specialty: 'leash-pulling',
  },
  {
    Scene: Fetch,
    title: 'Come back, every time',
    body: 'Recall games that turn "come!" into the best word they know.',
    specialty: 'recall',
  },
  {
    Scene: CatTarget,
    title: 'Happy, busy cats',
    body: 'Play and target training that saves your sofa (and your ankles).',
    specialty: 'cat-behaviour',
  },
] as const;

function Wins() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pt-8 pb-4 sm:px-6">
      <SectionHeading
        eyebrow="What training looks like"
        title="Small wins, every week"
        body="Each consult ends with a plan you can practise at home, a few minutes a day."
      />
      <ul className="mt-10 grid gap-5 md:grid-cols-3">
        {wins.map(({ Scene, title, body, specialty }) => (
          <li key={title}>
            <Link
              href={`/trainers?specialty=${specialty}`}
              className="group block h-full overflow-hidden rounded-3xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10"
            >
              <Scene />
              <div className="p-5">
                <h3 className="text-lg font-semibold group-hover:text-primary">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

async function FeaturedTrainers() {
  await connection(); // the landing page shell stays static; trainers stream in at request time
  const trainers = await getCachedTrainers(3);
  return (
    <ul className="mt-10 grid gap-5 md:grid-cols-3">
      {trainers.map((t) => (
        <li key={t.userId}>
          <TrainerCard trainer={t} />
        </li>
      ))}
    </ul>
  );
}

function TrainerGridSkeleton() {
  return (
    <ul className="mt-10 grid gap-5 md:grid-cols-3" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <li key={i} className="h-64 animate-pulse rounded-xl bg-card ring-1 ring-foreground/10" />
      ))}
    </ul>
  );
}
