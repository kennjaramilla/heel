import { describe, expect, it } from 'vitest';
import { formatCents, splitPayment } from './money';

describe('splitPayment', () => {
  it('takes the platform fee and gives the rest to the trainer', () => {
    expect(splitPayment(6000, 1500)).toEqual({ platformFee: 900, trainerPayout: 5100 });
  });

  it('never loses a cent to rounding', () => {
    for (const amount of [1, 333, 4999, 12345]) {
      const { platformFee, trainerPayout } = splitPayment(amount, 1500);
      expect(platformFee + trainerPayout).toBe(amount);
    }
  });

  it('rejects fractional amounts and out-of-range fees', () => {
    expect(() => splitPayment(10.5, 1500)).toThrow(RangeError);
    expect(() => splitPayment(1000, 10_001)).toThrow(RangeError);
  });
});

describe('formatCents', () => {
  it('formats cents as currency', () => {
    expect(formatCents(4500)).toBe('$45.00');
  });
});
