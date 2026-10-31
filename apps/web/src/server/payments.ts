import 'server-only';
import type { Booking } from './bookings';

export type CheckoutResult =
  { kind: 'paid'; paymentRef: string } | { kind: 'redirect'; url: string };

/** Where the money actually moves. The booking flow only talks to this interface. */
export interface PaymentProvider {
  name: string;
  label: string;
  startCheckout(booking: Booking): Promise<CheckoutResult>;
  /** Returns the provider's refund reference. */
  refund(booking: Booking, amountCents: number): Promise<string>;
  /** Sends the trainer their share. Must be idempotent per booking. */
  payout(booking: Booking): Promise<string>;
}

/** Marks the booking as paid straight away. Used until a real provider is configured. */
export const demoPayments: PaymentProvider = {
  name: 'demo',
  label: 'Demo payment (no card needed)',
  async startCheckout(booking) {
    return { kind: 'paid', paymentRef: `demo_${booking.id.slice(0, 8)}` };
  },
  async refund(booking, amountCents) {
    return `demo_refund_${booking.id.slice(0, 8)}_${amountCents}`;
  },
  async payout(booking) {
    return `demo_payout_${booking.id.slice(0, 8)}`;
  },
};

export function getPaymentProvider(): PaymentProvider {
  return demoPayments;
}
