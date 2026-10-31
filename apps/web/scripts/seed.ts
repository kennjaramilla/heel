// Demo data: a few published trainers plus two accounts reviewers can sign in with.
// Safe to run on every deploy: users are inserted once, profiles are reset to these values.
import { generateSlots, payoutDueAt, priceFor, type TrainerProfileInput } from '@heel/core';
import { createDb, schema } from '@heel/db';
import { and, eq, gt, inArray, lte } from 'drizzle-orm';
import { hashPassword } from 'better-auth/crypto';
import { DEMO_PASSWORD } from '../src/lib/demo';

type SeedTrainer = {
  id: string;
  name: string;
  email: string;
  slug: string;
  login?: boolean;
} & TrainerProfileInput;

const trainers: SeedTrainer[] = [
  {
    id: 'seed_sam',
    name: 'Sam Rivera',
    email: 'trainer@heel.dev',
    login: true,
    slug: 'sam-rivera',
    headline: 'Calm walks and polite puppies, with positive methods only',
    bio: 'I help owners of big, excited dogs turn chaotic walks into calm ones. Most of my clients see a real change within two sessions and a couple of weeks of short daily practice.',
    credentials: 'CPDT-KA',
    city: 'Austin, TX',
    timezone: 'America/Chicago',
    yearsExperience: 9,
    species: ['dog'],
    specialties: ['leash-pulling', 'puppy-basics', 'recall'],
    languages: ['English', 'Spanish'],
    price30Cents: 2500,
    price60Cents: 4500,
    published: true,
  },
  {
    id: 'seed_ana',
    name: 'Ana Dela Cruz',
    email: 'ana@trainers.heel.dev',
    slug: 'ana-dela-cruz',
    headline: 'Anxious and reactive pets, one small win at a time',
    bio: 'Barking at the window, panicking when you leave, lunging at other dogs: I build a plan around your home and your schedule, and we adjust it together every week.',
    credentials: 'Certified behaviour consultant',
    city: 'Manila, PH',
    timezone: 'Asia/Manila',
    yearsExperience: 7,
    species: ['dog', 'cat'],
    specialties: ['reactivity', 'separation-anxiety'],
    languages: ['English', 'Filipino'],
    price30Cents: 2000,
    price60Cents: 3500,
    published: true,
  },
  {
    id: 'seed_priya',
    name: 'Priya Shah',
    email: 'priya@trainers.heel.dev',
    slug: 'priya-shah',
    headline: 'Cat behaviour specialist for multi-cat homes',
    bio: 'Scratching the sofa, skipping the litter box, fights between cats who used to get along. Cats have good reasons for what they do; I help you find the reason and change the setup.',
    credentials: 'Feline behaviour specialist',
    city: 'London, UK',
    timezone: 'Europe/London',
    yearsExperience: 11,
    species: ['cat'],
    specialties: ['cat-behaviour', 'litter-box'],
    languages: ['English'],
    price30Cents: 2500,
    price60Cents: 4000,
    published: true,
  },
  {
    id: 'seed_marcus',
    name: 'Marcus Johnson',
    email: 'marcus@trainers.heel.dev',
    slug: 'marcus-johnson',
    headline: 'Serious aggression cases, handled safely',
    bio: 'Fifteen years working with dogs who bite or guard. We start with safety and management, then build trust and new habits step by step.',
    credentials: 'CPDT-KA, CBCC-KA',
    city: 'Atlanta, GA',
    timezone: 'America/New_York',
    yearsExperience: 15,
    species: ['dog'],
    specialties: ['aggression', 'reactivity'],
    languages: ['English'],
    price30Cents: 4000,
    price60Cents: 7000,
    published: true,
  },
  {
    id: 'seed_lucia',
    name: 'Lucía Fernández',
    email: 'lucia@trainers.heel.dev',
    slug: 'lucia-fernandez',
    headline: 'Puppy foundations: potty, biting, sleep and recall',
    bio: 'New puppy? We set up routines that work for your household from day one, so the next few months are fun instead of exhausting.',
    credentials: 'Certified trainer',
    city: 'Mexico City, MX',
    timezone: 'America/Mexico_City',
    yearsExperience: 5,
    species: ['dog'],
    specialties: ['puppy-basics', 'recall', 'leash-pulling'],
    languages: ['Spanish', 'English'],
    price30Cents: 1800,
    price60Cents: 3000,
    published: true,
  },
  {
    id: 'seed_hannah',
    name: 'Hannah Becker',
    email: 'hannah@trainers.heel.dev',
    slug: 'hannah-becker',
    headline: 'Separation anxiety, without leaving your dog to cry it out',
    bio: 'I use gradual, measurable absences and video check-ins so your dog learns that alone time is safe. Progress is tracked minute by minute.',
    credentials: 'Separation anxiety pro',
    city: 'Berlin, DE',
    timezone: 'Europe/Berlin',
    yearsExperience: 8,
    species: ['dog'],
    specialties: ['separation-anxiety', 'puppy-basics'],
    languages: ['German', 'English'],
    price30Cents: 3000,
    price60Cents: 5000,
    published: true,
  },
  {
    id: 'seed_kai',
    name: 'Kai Nakamura',
    email: 'kai@trainers.heel.dev',
    slug: 'kai-nakamura',
    headline: 'Happier indoor cats through play and routine',
    bio: 'Night-time zoomies, swatting at ankles, boredom. Most cat problems get better with the right play and feeding routine, and I will show you how.',
    credentials: 'Cat behaviour consultant',
    city: 'Seattle, WA',
    timezone: 'America/Los_Angeles',
    yearsExperience: 6,
    species: ['cat'],
    specialties: ['cat-behaviour', 'aggression'],
    languages: ['English'],
    price30Cents: 3000,
    price60Cents: 5500,
    published: true,
  },
  {
    id: 'seed_beatriz',
    name: 'Beatriz Souza',
    email: 'beatriz@trainers.heel.dev',
    slug: 'beatriz-souza',
    headline: 'Reactive dogs and reliable recall',
    bio: 'I work with dogs who struggle around triggers on walks and at the park, and with owners who want a recall they can trust off leash.',
    credentials: 'Certified trainer',
    city: 'São Paulo, BR',
    timezone: 'America/Sao_Paulo',
    yearsExperience: 10,
    species: ['dog'],
    specialties: ['reactivity', 'recall'],
    languages: ['Portuguese', 'English'],
    price30Cents: 2000,
    price60Cents: 3500,
    published: true,
  },
];

// Weekly hours in each trainer's own time zone: [weekdays, startHour, endHour].
const hours: Record<string, [number[], number, number][]> = {
  seed_sam: [
    [[1, 2, 3, 4, 5], 9, 17],
    [[6], 10, 13],
  ],
  seed_ana: [
    [[1, 2, 3, 4, 5], 18, 23],
    [[6], 9, 12],
  ], // evenings in Manila = mornings in the US
  seed_priya: [[[1, 2, 3, 4], 10, 18]],
  seed_marcus: [[[2, 3, 4, 5, 6], 8, 14]],
  seed_lucia: [[[1, 2, 3, 4, 5], 12, 20]],
  seed_hannah: [[[1, 3, 5], 9, 17]],
  seed_kai: [[[1, 2, 3, 4, 5], 15, 21]],
  seed_beatriz: [
    [[1, 2, 3, 4, 5], 8, 12],
    [[1, 2, 3, 4, 5], 14, 18],
  ],
};

const owners = [{ id: 'seed_owner', name: 'Riley Morgan', email: 'owner@heel.dev' }];

async function main() {
  const db = createDb();
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  await db
    .insert(schema.user)
    .values([
      ...trainers.map((t) => ({
        id: t.id,
        name: t.name,
        email: t.email,
        role: 'trainer' as const,
        emailVerified: true,
      })),
      ...owners.map((o) => ({ ...o, role: 'owner' as const, emailVerified: true })),
    ])
    .onConflictDoNothing();

  const logins = [...trainers.filter((t) => t.login), ...owners];
  await db
    .insert(schema.account)
    .values(
      logins.map((u) => ({
        id: `${u.id}_credential`,
        accountId: u.id,
        providerId: 'credential',
        userId: u.id,
        password: passwordHash,
      })),
    )
    .onConflictDoNothing();

  for (const { id, name, email, login, ...profile } of trainers) {
    await db
      .insert(schema.trainerProfile)
      .values({ ...profile, userId: id })
      .onConflictDoUpdate({ target: schema.trainerProfile.userId, set: profile });
  }

  // Reset demo hours on every deploy.
  const ids = Object.keys(hours);
  await db.delete(schema.availabilityRule).where(inArray(schema.availabilityRule.trainerId, ids));
  await db.insert(schema.availabilityRule).values(
    Object.entries(hours).flatMap(([trainerId, ranges]) =>
      ranges.flatMap(([days, start, end]) =>
        days.map((weekday) => ({
          trainerId,
          weekday,
          startMinute: start * 60,
          endMinute: end * 60,
        })),
      ),
    ),
  );

  await db
    .insert(schema.pet)
    .values([
      {
        id: 'seed_pet_mochi',
        ownerId: 'seed_owner',
        name: 'Mochi',
        species: 'dog',
        breed: 'Shiba Inu',
        bornOn: '2026-02-01',
        concerns: ['leash-pulling', 'puppy-basics'],
        notes: 'Pulls hardest when she sees other dogs. Great with people.',
      },
      {
        id: 'seed_pet_pepper',
        ownerId: 'seed_owner',
        name: 'Pepper',
        species: 'cat',
        breed: 'Domestic shorthair',
        bornOn: '2022-05-01',
        concerns: ['litter-box'],
        notes: 'Started skipping the litter box after we moved.',
      },
    ])
    .onConflictDoNothing();

  // Make sure the demo owner always has an upcoming consult with the demo trainer.
  const upcoming = await db
    .select({ id: schema.booking.id })
    .from(schema.booking)
    .where(
      and(
        eq(schema.booking.ownerId, 'seed_owner'),
        eq(schema.booking.status, 'confirmed'),
        gt(schema.booking.startsAt, new Date()),
      ),
    );
  if (upcoming.length === 0) {
    const sam = trainers[0]!;
    const rules = hours[sam.id]!.flatMap(([days, start, end]) =>
      days.map((weekday) => ({ weekday, startMinute: start * 60, endMinute: end * 60 })),
    );
    const [slot] = generateSlots({
      rules,
      blockedDates: [],
      timeZone: sam.timezone,
      lengthMinutes: 60,
      now: new Date(Date.now() + 2 * 86_400_000),
    });
    if (slot) {
      await db
        .insert(schema.booking)
        .values({
          id: crypto.randomUUID(),
          trainerId: sam.id,
          ownerId: 'seed_owner',
          petId: 'seed_pet_mochi',
          petName: 'Mochi',
          startsAt: slot,
          endsAt: new Date(slot.getTime() + 60 * 60_000),
          lengthMinutes: 60,
          status: 'confirmed',
          paymentProvider: 'demo',
          paymentRef: 'demo_seed',
          ownerNote: 'She pulls hardest when she sees other dogs.',
          ...priceFor(sam, 60),
        })
        .onConflictDoNothing();
    }
  }

  // A past consult with a finished plan and a paid-out trainer, so both sides have history to look at.
  const hourMs = 3_600_000;
  const pastStart = new Date(Math.floor(Date.now() / hourMs) * hourMs - 7 * 24 * hourMs);
  const sam = trainers[0]!;
  const done = await db
    .insert(schema.booking)
    .values({
      id: 'seed_past_consult',
      trainerId: sam.id,
      ownerId: 'seed_owner',
      petId: 'seed_pet_mochi',
      petName: 'Mochi',
      startsAt: pastStart,
      endsAt: new Date(pastStart.getTime() + hourMs),
      lengthMinutes: 60,
      status: 'completed',
      completedAt: new Date(pastStart.getTime() + 2 * hourMs),
      payoutStatus: 'paid',
      payoutDueAt: payoutDueAt(new Date(pastStart.getTime() + 2 * hourMs)),
      payoutRef: 'demo_payout_seed',
      paymentProvider: 'demo',
      paymentRef: 'demo_seed_past',
      ...priceFor(sam, 60),
    })
    .onConflictDoNothing()
    .returning({ id: schema.booking.id });
  if (done.length) {
    await db.insert(schema.trainingPlan).values({
      bookingId: 'seed_past_consult',
      summary:
        'Mochi is smart and food-motivated. She pulls hardest in the first five minutes, so we will burn some energy before walks and reward a loose leash early.',
      steps: [
        'Five minutes of sniffing games in the yard before every walk',
        'Stop the moment the leash goes tight; reward when she comes back to your side',
        'Two short training walks a day for the next two weeks',
        'Send me a 1-minute video next week so I can check her progress',
      ],
    });
  }

  // A consult that just ended and still needs a plan, so the trainer demo can write one.
  const awaiting = await db
    .select({ id: schema.booking.id })
    .from(schema.booking)
    .where(
      and(
        eq(schema.booking.trainerId, sam.id),
        eq(schema.booking.status, 'confirmed'),
        lte(schema.booking.endsAt, new Date()),
      ),
    );
  if (awaiting.length === 0) {
    const start = new Date(Math.floor(Date.now() / hourMs) * hourMs - 3 * hourMs);
    await db
      .insert(schema.booking)
      .values({
        id: crypto.randomUUID(),
        trainerId: sam.id,
        ownerId: 'seed_owner',
        petId: 'seed_pet_pepper',
        petName: 'Pepper',
        startsAt: start,
        endsAt: new Date(start.getTime() + 30 * 60_000),
        lengthMinutes: 30,
        status: 'confirmed',
        paymentProvider: 'demo',
        paymentRef: 'demo_seed_recent',
        ...priceFor(sam, 30),
      })
      .onConflictDoNothing();
  }

  console.log(`Seeded ${trainers.length} trainers, ${owners.length} owner and 2 pets.`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
