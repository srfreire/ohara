import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

import { get_supabase_client } from '../../../lib/supabase.client';
import {
  CreateCommentDto,
  UpdateCommentDto,
  Comment,
  QueryCommentsDto,
  CommentPatchArray,
} from '../models/comment.model';
import {
  parse_cursor_query,
  apply_cursor_conditions,
  build_cursor_response,
  CursorPaginatedResponse,
} from '../../../common/pagination';

@Injectable()
export class CommentsService {
  private supabase = get_supabase_client();

  async find_all(query_params: QueryCommentsDto): Promise<CursorPaginatedResponse<Comment>> {
    let query_builder = this.supabase.from('comments').select('*');

    if (query_params.documentId) {
      query_builder = query_builder.eq('document_id', query_params.documentId);
    }

    if (query_params.user_id) {
      query_builder = query_builder.eq('user_id', query_params.user_id);
    }

    if (query_params.parent_comment_id) {
      query_builder = query_builder.eq('parent_comment_id', query_params.parent_comment_id);
    }

    const sort_by = query_params.sort_by || 'created_at';
    const order = query_params.order || 'desc';
    const ascending = order === 'asc';

    const cursor_conditions = parse_cursor_query(query_params.cursor, sort_by, ascending);
    query_builder = apply_cursor_conditions(query_builder, cursor_conditions);

    query_builder = query_builder.order(sort_by, { ascending }).limit(query_params.limit + 1);

    const { data, error } = await query_builder;

    if (error) {
      throw new Error(`Failed to fetch comments: ${error.message}`);
    }

    return build_cursor_response(data as Comment[], query_params.limit, sort_by);
  }

  async create(create_comment_dto: CreateCommentDto): Promise<Comment> {
    if (create_comment_dto.start_offset >= create_comment_dto.end_offset) {
      throw new BadRequestException('start_offset must be less than end_offset');
    }

    const { data, error } = await this.supabase
      .from('comments')
      .insert(create_comment_dto)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create comment: ${error.message}`);
    }

    return data as Comment;
  }

  async update(id: string, update_comment_dto: UpdateCommentDto): Promise<Comment> {
    const { data, error } = await this.supabase
      .from('comments')
      .update(update_comment_dto)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }

    return data as Comment;
  }

  async patch(id: string, patch_operations: CommentPatchArray): Promise<Comment> {
    const { data: existing_comment, error: fetch_error } = await this.supabase
      .from('comments')
      .select('*')
      .eq('id', id)
      .single();

    if (fetch_error || !existing_comment) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }

    const updated_comment: any = { ...existing_comment };

    for (const operation of patch_operations) {
      if (operation.op === 'replace') {
        const field = operation.path.substring(1);
        if (field === 'content') {
          updated_comment.content = operation.value as string;
        } else if (field === 'start_offset') {
          updated_comment.start_offset = operation.value as number;
        } else if (field === 'end_offset') {
          updated_comment.end_offset = operation.value as number;
        }
      }
    }

    if (updated_comment.start_offset >= updated_comment.end_offset) {
      throw new BadRequestException('start_offset must be less than end_offset');
    }

    const { data, error } = await this.supabase
      .from('comments')
      .update({
        content: updated_comment.content,
        start_offset: updated_comment.start_offset,
        end_offset: updated_comment.end_offset,
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to patch comment: ${error?.message || 'Unknown error'}`);
    }

    return data as Comment;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from('comments').delete().eq('id', id);

    if (error) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }
  }
}
