// Demo data: a few published trainers plus two accounts reviewers can sign in with.
// Safe to run on every deploy: users are inserted once, profiles are reset to these values.
import { generateSlots, payoutDueAt, priceFor, type TrainerProfileInput } from '@heel/core';
import { createDb, schema } from '@heel/db';
import { and, eq, gt, inArray, lte, sql } from 'drizzle-orm';
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
    name: 'Sam Villanueva',
    email: 'trainer@heel.dev',
    login: true,
    slug: 'sam-villanueva',
    headline: 'Calm walks and polite puppies, with positive methods only',
    bio: 'I help owners of big, excited dogs turn chaotic walks around Makati into calm ones, from busy sidewalks to condo elevators. Most clients see a real change within two sessions and a couple of weeks of short daily practice.',
    credentials: 'CPDT-KA',
    city: 'Makati City',
    timezone: 'Asia/Manila',
    yearsExperience: 9,
    species: ['dog'],
    specialties: ['leash-pulling', 'puppy-basics', 'recall'],
    languages: ['English', 'Filipino'],
    price30Cents: 90_000,
    price60Cents: 160_000,
    published: true,
  },
  {
    id: 'seed_ana',
    name: 'Ana Dela Cruz',
    email: 'ana@trainers.heel.dev',
    slug: 'ana-dela-cruz',
    headline: 'Anxious and reactive pets, one small win at a time',
    bio: 'Barking at the gate, panicking when you leave for work, lunging at other dogs in the village: I build a plan around your home and your schedule, and we adjust it together every week.',
    credentials: 'Certified behaviour consultant',
    city: 'Quezon City',
    timezone: 'Asia/Manila',
    yearsExperience: 7,
    species: ['dog', 'cat'],
    specialties: ['reactivity', 'separation-anxiety'],
    languages: ['English', 'Filipino'],
    price30Cents: 80_000,
    price60Cents: 140_000,
    published: true,
  },
  {
    id: 'seed_priya',
    name: 'Pia Mendoza',
    email: 'pia@trainers.heel.dev',
    slug: 'pia-mendoza',
    headline: 'Cat behaviour specialist for multi-cat homes',
    bio: 'Scratching the sofa, skipping the litter box, fights between puspins who used to get along. Cats have good reasons for what they do; I help you find the reason and change the setup, even in a small condo.',
    credentials: 'Feline behaviour specialist',
    city: 'BGC, Taguig',
    timezone: 'Asia/Manila',
    yearsExperience: 11,
    species: ['cat'],
    specialties: ['cat-behaviour', 'litter-box'],
    languages: ['English', 'Filipino'],
    price30Cents: 100_000,
    price60Cents: 180_000,
    published: true,
  },
  {
    id: 'seed_marcus',
    name: 'Marco Bautista',
    email: 'marco@trainers.heel.dev',
    slug: 'marco-bautista',
    headline: 'Serious aggression cases, handled safely',
    bio: 'Fifteen years working with dogs who bite or guard, from rescued aspins to big guard breeds. We start with safety and management, then build trust and new habits step by step.',
    credentials: 'CPDT-KA, CBCC-KA',
    city: 'Pasig City',
    timezone: 'Asia/Manila',
    yearsExperience: 15,
    species: ['dog'],
    specialties: ['aggression', 'reactivity'],
    languages: ['English', 'Filipino'],
    price30Cents: 150_000,
    price60Cents: 280_000,
    published: true,
  },
  {
    id: 'seed_lucia',
    name: 'Lucia Ramos',
    email: 'lucia@trainers.heel.dev',
    slug: 'lucia-ramos',
    headline: 'Puppy foundations: potty, biting, sleep and recall',
    bio: 'New puppy? We set up routines that work for your household from day one, including pee pads for condo living, so the next few months are fun instead of exhausting.',
    credentials: 'Certified trainer',
    city: 'Mandaluyong',
    timezone: 'Asia/Manila',
    yearsExperience: 5,
    species: ['dog'],
    specialties: ['puppy-basics', 'recall', 'leash-pulling'],
    languages: ['Filipino', 'English', 'Cebuano'],
    price30Cents: 70_000,
    price60Cents: 120_000,
    published: true,
  },
  {
    id: 'seed_hannah',
    name: 'Hannah Lim',
    email: 'hannah@trainers.heel.dev',
    slug: 'hannah-lim',
    headline: 'Separation anxiety, without leaving your dog to cry it out',
    bio: 'I use gradual, measurable absences and video check-ins so your dog learns that alone time is safe, whether you work on-site or go back to the office twice a week.',
    credentials: 'Separation anxiety pro',
    city: 'San Juan',
    timezone: 'Asia/Manila',
    yearsExperience: 8,
    species: ['dog'],
    specialties: ['separation-anxiety', 'puppy-basics'],
    languages: ['English', 'Filipino'],
    price30Cents: 120_000,
    price60Cents: 200_000,
    published: true,
  },
  {
    id: 'seed_kai',
    name: 'Kai Tan',
    email: 'kai@trainers.heel.dev',
    slug: 'kai-tan',
    headline: 'Happier indoor cats through play and routine',
    bio: 'Night-time zoomies, swatting at ankles, hiding during typhoon storms. Most cat problems get better with the right play and feeding routine, and I will show you how.',
    credentials: 'Cat behaviour consultant',
    city: 'Malate, Manila',
    timezone: 'Asia/Manila',
    yearsExperience: 6,
    species: ['cat'],
    specialties: ['cat-behaviour', 'aggression'],
    languages: ['English', 'Filipino', 'Hiligaynon'],
    price30Cents: 110_000,
    price60Cents: 200_000,
    published: true,
  },
  {
    id: 'seed_beatriz',
    name: 'Bea Santos',
    email: 'bea@trainers.heel.dev',
    slug: 'bea-santos',
    headline: 'Reactive dogs and reliable recall',
    bio: 'I work with dogs who struggle around tricycles, strays and fireworks, and with owners who want a recall they can trust at the dog park.',
    credentials: 'Certified trainer',
    city: 'Parañaque',
    timezone: 'Asia/Manila',
    yearsExperience: 10,
    species: ['dog'],
    specialties: ['reactivity', 'recall'],
    languages: ['English', 'Filipino', 'Ilocano'],
    price30Cents: 80_000,
    price60Cents: 150_000,
    published: true,
  },
];

// Weekly hours in Manila time: [weekdays, startHour, endHour].
const hours: Record<string, [number[], number, number][]> = {
  seed_sam: [
    [[1, 2, 3, 4, 5], 9, 17],
    [[6], 10, 13],
  ],
  seed_ana: [
    [[1, 2, 3, 4, 5], 18, 22],
    [[6], 9, 12],
  ], // after-work evenings and Saturday mornings
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

const owners = [{ id: 'seed_owner', name: 'Jamie Reyes', email: 'owner@heel.dev' }];

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
    .onConflictDoUpdate({
      target: schema.user.id,
      set: { name: sql`excluded.name`, email: sql`excluded.email` },
    });

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
        breed: 'Aspin',
        bornOn: '2026-02-01',
        concerns: ['leash-pulling', 'puppy-basics'],
        notes: 'Pulls hardest when she sees other dogs on our street. Great with people.',
      },
      {
        id: 'seed_pet_pepper',
        ownerId: 'seed_owner',
        name: 'Muning',
        species: 'cat',
        breed: 'Puspin',
        bornOn: '2022-05-01',
        concerns: ['litter-box'],
        notes: 'Started skipping the litter box after we moved to a condo in Pasig.',
      },
    ])
    .onConflictDoUpdate({
      target: schema.pet.id,
      set: { name: sql`excluded.name`, breed: sql`excluded.breed`, notes: sql`excluded.notes` },
    });
  // Bookings keep a copy of the pet's name, so follow the demo pets' current names.
  await db
    .update(schema.booking)
    .set({
      petName: sql`(select name from ${schema.pet} where ${schema.pet.id} = ${schema.booking.petId})`,
    })
    .where(inArray(schema.booking.petId, ['seed_pet_mochi', 'seed_pet_pepper']));

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
        'Five minutes of sniffing games at home before every walk',
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
        petName: 'Muning',
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

  // Admin login, only when a password is configured (never a public demo account).
  if (process.env.ADMIN_PASSWORD) {
    const adminHash = await hashPassword(process.env.ADMIN_PASSWORD);
    await db
      .insert(schema.user)
      .values({
        id: 'seed_admin',
        name: 'Heel Admin',
        email: 'admin@heel.dev',
        role: 'admin',
        emailVerified: true,
      })
      .onConflictDoNothing();
    await db
      .insert(schema.account)
      .values({
        id: 'seed_admin_credential',
        accountId: 'seed_admin',
        providerId: 'credential',
        userId: 'seed_admin',
        password: adminHash,
      })
      .onConflictDoUpdate({ target: schema.account.id, set: { password: adminHash } });
  }

  console.log(`Seeded ${trainers.length} trainers, ${owners.length} owner and 2 pets.`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
