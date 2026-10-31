'use client';

import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { type PlanState, savePlanAction } from '@/app/bookings/plan-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormAction } from '@/lib/use-form-action';

const initialState: PlanState = {};

export function PlanForm({
  bookingId,
  petName,
  initial,
}: {
  bookingId: string;
  petName: string;
  initial?: { summary: string; steps: string[] };
}) {
  const [steps, setSteps] = useState<string[]>(initial?.steps.length ? initial.steps : ['']);
  const [state, onSubmit, pending] = useFormAction(savePlanAction, initialState);

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <input type="hidden" name="bookingId" value={bookingId} />
      <div className="grid gap-2">
        <Label htmlFor="summary">How did it go?</Label>
        <textarea
          id="summary"
          name="summary"
          rows={4}
          maxLength={1500}
          defaultValue={initial?.summary}
          placeholder={`What you noticed about ${petName} and what to focus on.`}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
          required
        />
      </div>
      <fieldset className="grid gap-2">
        <legend className="mb-1 text-sm font-medium">Homework</legend>
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-5 text-right text-sm text-muted-foreground">{i + 1}.</span>
            <Input
              name="step"
              aria-label={`Step ${i + 1}`}
              value={step}
              maxLength={200}
              onChange={(e) => setSteps((s) => s.map((x, j) => (j === i ? e.target.value : x)))}
              placeholder="Two 5-minute sessions a day on a loose leash"
            />
            {steps.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove step ${i + 1}`}
                onClick={() => setSteps((s) => s.filter((_, j) => j !== i))}
              >
                <X />
              </Button>
            )}
          </div>
        ))}
        {steps.length < 8 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-fit"
            onClick={() => setSteps((s) => [...s, ''])}
          >
            <Plus aria-hidden="true" /> Add step
          </Button>
        )}
      </fieldset>
      {state.message && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? 'Sending…' : initial ? 'Update plan' : `Send plan to ${petName}'s owner`}
      </Button>
    </form>
  );
}
