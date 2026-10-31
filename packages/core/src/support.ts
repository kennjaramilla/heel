import { z } from 'zod';

export const supportTicketInput = z.object({
  subject: z.string().trim().min(3, 'Add a short subject').max(120),
  message: z.string().trim().min(10, 'Tell us a bit more (10+ characters)').max(2000),
  bookingId: z
    .string()
    .trim()
    .max(64)
    .transform((v) => v || undefined)
    .optional(),
});

export const supportReplyInput = z.object({
  body: z.string().trim().min(1, 'Write a reply').max(2000),
});

export type SupportTicketInput = z.infer<typeof supportTicketInput>;
