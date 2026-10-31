'use client';

import { Trash2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { removePet } from '@/app/dashboard/pets/actions';
import { Button } from '@/components/ui/button';

// Two clicks instead of a browser confirm() dialog.
export function RemovePetButton({ id, name }: { id: string; name: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <Button variant="ghost" onClick={() => setConfirming(true)}>
        <Trash2 aria-hidden="true" /> Remove {name}
      </Button>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="destructive"
        disabled={pending}
        onClick={() => startTransition(() => removePet(id))}
      >
        {pending ? 'Removing…' : `Yes, remove ${name}`}
      </Button>
      <Button variant="ghost" onClick={() => setConfirming(false)}>
        Cancel
      </Button>
    </div>
  );
}
