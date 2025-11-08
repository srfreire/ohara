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
  // Pagination (cursor-based)
  limit: z.coerce.number().min(1).max(100).optional().default(25),
  cursor: z.string().optional(), // Base64 encoded cursor for cursor-based pagination
  // Filters
  documentId: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(), // Filter by user
  parent_comment_id: z.string().uuid().optional(), // Filter by parent (replies)
  // Sorting
  sort_by: z.enum(['created_at', 'content']).optional().default('created_at'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

// JSON Patch operation schema (RFC 6902)
export const comment_patch_operation_schema = z.discriminatedUnion('op', [
  z.object({
    op: z.literal('replace'),
    path: z.enum(['/content', '/start_offset', '/end_offset']),
    value: z.union([z.string(), z.number().int()]),
  }),
]);

export const comment_patch_array_schema = z.array(comment_patch_operation_schema);

export type Comment = z.infer<typeof comment_schema>;
export type CreateCommentDto = z.infer<typeof create_comment_schema>;
export type UpdateCommentDto = z.infer<typeof update_comment_schema>;
export type QueryCommentsDto = z.infer<typeof query_comments_schema>;
export type CommentPatchOperation = z.infer<typeof comment_patch_operation_schema>;
export type CommentPatchArray = z.infer<typeof comment_patch_array_schema>;
