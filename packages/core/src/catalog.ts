// Fixed lists shared by forms, filters and the database, so they can't drift apart.
export const SPECIES = ['dog', 'cat'] as const;
export type Species = (typeof SPECIES)[number];

export const SPECIALTIES = [
  { id: 'puppy-basics', label: 'Puppy basics' },
  { id: 'leash-pulling', label: 'Leash pulling' },
  { id: 'reactivity', label: 'Reactivity' },
  { id: 'separation-anxiety', label: 'Separation anxiety' },
  { id: 'recall', label: 'Recall' },
  { id: 'aggression', label: 'Aggression' },
  { id: 'cat-behaviour', label: 'Cat behaviour' },
  { id: 'litter-box', label: 'Litter box issues' },
] as const;
export type SpecialtyId = (typeof SPECIALTIES)[number]['id'];
export const SPECIALTY_IDS = SPECIALTIES.map((s) => s.id) as [SpecialtyId, ...SpecialtyId[]];

export function specialtyLabel(id: string) {
  return SPECIALTIES.find((s) => s.id === id)?.label ?? id;
}

export const LANGUAGES = [
  'English',
  'Filipino',
  'Cebuano',
  'Ilocano',
  'Hiligaynon',
  'Kapampangan',
] as const;

export const CONSULT_LENGTHS = [30, 60] as const;
export type ConsultLength = (typeof CONSULT_LENGTHS)[number];
