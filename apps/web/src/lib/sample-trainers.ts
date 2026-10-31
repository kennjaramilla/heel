// Placeholder trainers for the landing page until profiles come from the database.
export type SampleTrainer = {
  name: string;
  initials: string;
  credential: string;
  city: string;
  specialties: string[];
  species: ('dog' | 'cat')[];
  priceCents: number;
  nextAvailable: string;
  tone: 'green' | 'amber' | 'peach';
};

export const sampleTrainers: SampleTrainer[] = [
  {
    name: 'Sam Rivera',
    initials: 'SR',
    credential: 'CPDT-KA',
    city: 'Austin, TX',
    specialties: ['Leash pulling', 'Puppy basics'],
    species: ['dog'],
    priceCents: 4500,
    nextAvailable: 'Today',
    tone: 'green',
  },
  {
    name: 'Ana Dela Cruz',
    initials: 'AD',
    credential: 'Certified behaviour consultant',
    city: 'Manila, PH',
    specialties: ['Reactivity', 'Separation anxiety'],
    species: ['dog', 'cat'],
    priceCents: 3500,
    nextAvailable: 'Tomorrow',
    tone: 'amber',
  },
  {
    name: 'Priya Shah',
    initials: 'PS',
    credential: 'Feline behaviour specialist',
    city: 'London, UK',
    specialties: ['Litter box issues', 'Cat behaviour'],
    species: ['cat'],
    priceCents: 4000,
    nextAvailable: 'Thu',
    tone: 'peach',
  },
];
