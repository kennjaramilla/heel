import { z } from 'zod';
import { CONSULT_LENGTHS, type ConsultLength } from './catalog';
import { splitPayment } from './money';

export const PLATFORM_FEE_BPS = 1500; // Heel keeps 15%
export const HOLD_MINUTES = 10;

export const bookingRequest = z.object({
  trainerSlug: z.string().min(1).max(80),
  startsAt: z.iso.datetime({ offset: true }),
  lengthMinutes: z.coerce
    .number()
    .refine(
      (n): n is ConsultLength => (CONSULT_LENGTHS as readonly number[]).includes(n),
      'Pick 30 or 60 minutes',
    ),
  petId: z.string().min(1, 'Pick which pet this is for'),
  note: z.string().trim().max(500).default(''),
});

export type BookingRequest = z.infer<typeof bookingRequest>;

export function priceFor(
  prices: { price30Cents: number; price60Cents: number },
  length: ConsultLength,
) {
  const priceCents = length === 30 ? prices.price30Cents : prices.price60Cents;
  const { platformFee, trainerPayout } = splitPayment(priceCents, PLATFORM_FEE_BPS);
  return { priceCents, platformFeeCents: platformFee, trainerPayoutCents: trainerPayout };
}
