import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

import { get_supabase_client } from '../../../lib/supabase.client';
import {
  CreateCommentDto,
  UpdateCommentDto,
  Comment,
  QueryCommentsDto,
} from '../models/comment.model';

@Injectable()
export class CommentsService {
  private supabase = get_supabase_client();

  async find_all(query_params: QueryCommentsDto): Promise<Comment[]> {
    let query_builder = this.supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false })
      .range(query_params.offset, query_params.offset + query_params.limit - 1);

    if (query_params.documentId) {
      query_builder = query_builder.eq('document_id', query_params.documentId);
    }

    const { data, error } = await query_builder;

    if (error) {
      throw new Error(`Failed to fetch comments: ${error.message}`);
    }

    return data as Comment[];
  }

  async create(create_comment_dto: CreateCommentDto): Promise<Comment> {
    // Validate start_offset < end_offset (also done in schema)
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

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from('comments').delete().eq('id', id);

    if (error) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }
  }
}
