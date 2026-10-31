import { describe, expect, it } from 'vitest';
import { safeNext } from './safe-next';

describe('safeNext', () => {
  it('keeps same-site paths', () => {
    expect(safeNext('/dashboard/bookings')).toBe('/dashboard/bookings');
  });

  it('falls back for missing, external or protocol-relative values', () => {
    for (const bad of [null, '', 'https://evil.com', '//evil.com', '/\\evil.com']) {
      expect(safeNext(bad)).toBe('/dashboard');
    }
  });
});
