import { z } from 'zod';

export const message_schema = z.object({
  role: z.string(),
  content: z.string(),
  timestamp: z.string().optional(),
});

export const stream_request_schema = z.object({
  messages: z.array(message_schema),
  model: z.string().optional().default('gpt-4.1'),
  document_id: z.string().uuid().optional(),
});

export type Message = z.infer<typeof message_schema>;
export type StreamRequestDto = z.infer<typeof stream_request_schema>;
