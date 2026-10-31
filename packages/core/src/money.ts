// Money is always integer cents; never floats.
export type Cents = number;

export function assertCents(value: number): asserts value is Cents {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`Expected a non-negative integer amount in cents, got ${value}`);
  }
}

/** Splits a payment into the platform fee and the trainer's share. Fee is in basis points (1500 = 15%). */
export function splitPayment(
  amount: Cents,
  feeBps: number,
): { platformFee: Cents; trainerPayout: Cents } {
  assertCents(amount);
  if (!Number.isInteger(feeBps) || feeBps < 0 || feeBps > 10_000) {
    throw new RangeError(`Fee must be 0–10000 basis points, got ${feeBps}`);
  }
  const platformFee = Math.round((amount * feeBps) / 10_000);
  return { platformFee, trainerPayout: amount - platformFee };
}

/** Formats cents as currency; whole amounts drop the ".00" ($45, $45.50). */
export function formatCents(amount: Cents, currency = 'USD', locale = 'en-US'): string {
  assertCents(amount);
  const whole = amount % 100 === 0;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount / 100);
}
