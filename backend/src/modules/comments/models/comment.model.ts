import { z } from 'zod';

export const comment_schema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  parent_comment_id: z.string().uuid().nullable(),
  document_id: z.string().uuid().nullable(),
  content: z.string(),
  start_offset: z.number().int(),
  end_offset: z.number().int(),
  created_at: z.string(),
});

export const create_comment_schema = z
  .object({
    user_id: z.string().uuid(),
    parent_comment_id: z.string().uuid().optional(),
    document_id: z.string().uuid().optional(),
    content: z.string().min(1),
    start_offset: z.number().int().min(0).optional().default(0),
    end_offset: z.number().int().min(0).optional().default(0),
  })
  .refine((data) => data.start_offset < data.end_offset, {
    message: 'start_offset must be less than end_offset',
    path: ['start_offset'],
  });

export const update_comment_schema = z
  .object({
    content: z.string().min(1).optional(),
    start_offset: z.number().int().min(0).optional(),
    end_offset: z.number().int().min(0).optional(),
  })
  .refine(
    (data) => {
      if (data.start_offset !== undefined && data.end_offset !== undefined) {
        return data.start_offset < data.end_offset;
      }
      return true;
    },
    {
      message: 'start_offset must be less than end_offset',
      path: ['start_offset'],
    },
  );

export const query_comments_schema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(25),
  offset: z.coerce.number().min(0).optional().default(0),
  documentId: z.string().uuid().optional(),
});

export type Comment = z.infer<typeof comment_schema>;
export type CreateCommentDto = z.infer<typeof create_comment_schema>;
export type UpdateCommentDto = z.infer<typeof update_comment_schema>;
export type QueryCommentsDto = z.infer<typeof query_comments_schema>;
