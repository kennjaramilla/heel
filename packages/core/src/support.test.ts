import { describe, expect, it } from 'vitest';
import { supportReplyInput, supportTicketInput } from './support';

describe('supportTicketInput', () => {
  it('trims and treats an empty booking as none', () => {
    expect(
      supportTicketInput.parse({
        subject: '  Refund question ',
        message: 'I was charged twice for one consult.',
        bookingId: '',
      }),
    ).toEqual({ subject: 'Refund question', message: 'I was charged twice for one consult.' });
  });

  it('rejects a message that is too short', () => {
    const result = supportTicketInput.safeParse({ subject: 'Help', message: 'hi' });
    expect(result.success).toBe(false);
  });

  it('rejects a blank reply', () => {
    expect(supportReplyInput.safeParse({ body: '   ' }).success).toBe(false);
  });
});
