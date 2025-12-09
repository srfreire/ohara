import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';

import { get_supabase_client } from '../../../lib/supabase.client';
import {
  CreateCommentDto,
  UpdateCommentDto,
  Comment,
  QueryCommentsDto,
} from '../models/comment.model';
import {
  parse_cursor_query,
  apply_cursor_conditions,
  build_cursor_response,
  CursorPaginatedResponse,
} from '../../../common/pagination/index';

@Injectable()
export class CommentsService {
  private supabase = get_supabase_client();

  async find_all(query_params: QueryCommentsDto): Promise<CursorPaginatedResponse<Comment>> {
    // Include user data via JOIN using Supabase nested query syntax
    let query_builder = this.supabase.from('comments').select(`
      *,
      users (
        name
      )
    `);

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

    // Transform nested user data to flat user_name field for frontend compatibility
    const transformed_data = (data as any[]).map(comment => ({
      ...comment,
      user_name: comment.users?.name || null,
      users: undefined // Remove nested object
    }));

    return build_cursor_response(transformed_data as Comment[], query_params.limit, sort_by);
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

  async update(id: string, update_comment_dto: UpdateCommentDto, user_id: string): Promise<Comment> {
    // Primero obtener el comentario para validar ownership
    const { data: comment, error: fetchError } = await this.supabase
      .from('comments')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !comment) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }

    // Validar ownership
    if (comment.user_id !== user_id) {
      throw new ForbiddenException('You can only update your own comments');
    }

    // Actualizar
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

  async delete(id: string, user_id: string): Promise<void> {
    // Primero obtener el comentario para validar ownership
    const { data: comment, error: fetchError } = await this.supabase
      .from('comments')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !comment) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }

    // Validar ownership
    if (comment.user_id !== user_id) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    // Eliminar
    const { error } = await this.supabase.from('comments').delete().eq('id', id);

    if (error) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }
  }
}
