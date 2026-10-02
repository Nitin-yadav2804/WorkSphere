import { z } from 'zod';
export const createMessageSchema = z.object({
  content: z.string().trim().max(2000).default(''),
  attachments: z.array(z.string().regex(/^[a-f\d]{24}$/i)).max(5).default([]),
}).refine(value => value.content || value.attachments.length, { message: 'Add a message or attachment' });
