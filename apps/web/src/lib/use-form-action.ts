'use client';

import { useActionState, useTransition } from 'react';

/**
 * Like useActionState, but submits through onSubmit instead of <form action>.
 * React resets a form after an action runs, which would wipe what the user typed when
 * validation fails and leave controlled fields out of sync with their state.
 */
export function useFormAction<State>(
  action: (state: Awaited<State>, form: FormData) => State | Promise<State>,
  initialState: Awaited<State>,
) {
  const [state, dispatch, actionPending] = useActionState(action, initialState);
  const [transitionPending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    startTransition(() => dispatch(form));
  }

  return [state, onSubmit, actionPending || transitionPending] as const;
}
