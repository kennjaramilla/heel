import { describe, expect, it } from 'vitest';
import { bookingRequest, priceFor } from './booking';

describe('priceFor', () => {
  it('splits the price into a 15% platform fee and the trainer payout', () => {
    expect(priceFor({ price30Cents: 2500, price60Cents: 4500 }, 60)).toEqual({
      priceCents: 4500,
      platformFeeCents: 675,
      trainerPayoutCents: 3825,
    });
    expect(priceFor({ price30Cents: 2500, price60Cents: 4500 }, 30).priceCents).toBe(2500);
  });
});

describe('bookingRequest', () => {
  const valid = {
    trainerSlug: 'sam-rivera',
    startsAt: '2026-11-02T14:00:00.000Z',
    lengthMinutes: '60',
    petId: 'p1',
  };

  it('accepts a valid request', () => {
    expect(bookingRequest.parse(valid)).toMatchObject({ lengthMinutes: 60, note: '' });
  });

  it('rejects other lengths, bad dates and missing pets', () => {
    expect(bookingRequest.safeParse({ ...valid, lengthMinutes: '45' }).success).toBe(false);
    expect(bookingRequest.safeParse({ ...valid, startsAt: 'tomorrow' }).success).toBe(false);
    expect(bookingRequest.safeParse({ ...valid, petId: '' }).success).toBe(false);
  });
});
