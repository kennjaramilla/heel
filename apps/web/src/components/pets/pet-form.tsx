'use client';

import { SPECIALTIES } from '@heel/core';
import { Cat, Dog } from 'lucide-react';

import { type PetFormState, savePet } from '@/app/dashboard/pets/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormAction } from '@/lib/use-form-action';
import type { Pet } from '@/server/pets';

const initialState: PetFormState = {};

export function PetForm({ pet }: { pet?: Pet }) {
  const [state, onSubmit, pending] = useFormAction(savePet, initialState);
  const errors = state.fieldErrors ?? {};

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-6 rounded-2xl border border-border bg-card p-5 sm:p-6"
    >
      {pet && <input type="hidden" name="id" value={pet.id} />}

      <fieldset>
        <legend className="mb-2 text-sm font-medium">Dog or cat?</legend>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { value: 'dog', label: 'Dog', icon: Dog },
              { value: 'cat', label: 'Cat', icon: Cat },
            ] as const
          ).map(({ value, label, icon: Icon }) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3 transition-colors has-checked:border-primary has-checked:bg-secondary/60 has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
            >
              <input
                type="radio"
                name="species"
                value={value}
                defaultChecked={(pet?.species ?? 'dog') === value}
                className="sr-only"
              />
              <Icon className="size-5 text-primary" aria-hidden="true" />
              <span className="font-medium">{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" name="name" error={errors.name}>
          <Input id="name" name="name" defaultValue={pet?.name} maxLength={40} required />
        </Field>
        <Field label="Breed" name="breed" error={errors.breed}>
          <Input
            id="breed"
            name="breed"
            defaultValue={pet?.breed}
            placeholder="Mixed is fine"
            maxLength={60}
          />
        </Field>
        <Field label="Born (roughly)" name="bornOn" error={errors.bornOn}>
          <Input id="bornOn" name="bornOn" type="month" defaultValue={pet?.bornOn ?? ''} />
        </Field>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">What would you like help with?</legend>
        <div className="flex flex-wrap gap-2">
          {SPECIALTIES.map((s) => (
            <label
              key={s.id}
              className="cursor-pointer rounded-full border border-border bg-background px-3 py-1.5 text-sm transition-colors has-checked:border-primary has-checked:bg-secondary has-checked:text-secondary-foreground has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
            >
              <input
                type="checkbox"
                name="concerns"
                value={s.id}
                defaultChecked={pet?.concerns.includes(s.id)}
                className="sr-only"
              />
              {s.label}
            </label>
          ))}
        </div>
        {errors.concerns && <p className="mt-2 text-xs text-destructive">{errors.concerns[0]}</p>}
      </fieldset>

      <Field label="Anything a trainer should know?" name="notes" error={errors.notes}>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          maxLength={1000}
          defaultValue={pet?.notes}
          placeholder="Pulls hardest when she sees other dogs. Fine with people."
          className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </Field>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? 'Saving…' : pet ? 'Save changes' : 'Add pet'}
        </Button>
        {state.message && (
          <p role="alert" className="text-sm text-destructive">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error[0]}</p>}
    </div>
  );
}
