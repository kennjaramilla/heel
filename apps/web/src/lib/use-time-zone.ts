'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/** The viewer's time zone, or null during server rendering (so server and client HTML match). */
export function useTimeZone() {
  return useSyncExternalStore(
    subscribe,
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    () => null,
  );
}
