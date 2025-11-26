import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';

import { get_supabase_client } from '../../../lib/supabase.client';
import {
  CreateReactionDto,
  UpdateReactionDto,
  Reaction,
  QueryReactionsDto,
} from '../models/reaction.model';
import {
  parse_cursor_query,
  apply_cursor_conditions,
  build_cursor_response,
  CursorPaginatedResponse,
} from '../../../common/pagination/index';

@Injectable()
export class ReactionsService {
  private supabase = get_supabase_client();

  private get_error_message(error: unknown): string {
    if (error && typeof error === 'object' && 'message' in error) {
      return String(error.message);
    }
    return 'Unknown error';
  }

  async find_all(query_params: QueryReactionsDto): Promise<CursorPaginatedResponse<Reaction>> {
    let query_builder = this.supabase.from('reactions').select('*');

    if (query_params.commentId) {
      query_builder = query_builder.eq('comment_id', query_params.commentId);
    }

    if (query_params.reaction_type) {
      query_builder = query_builder.eq('reaction_type', query_params.reaction_type);
    }

    if (query_params.user_id) {
      query_builder = query_builder.eq('user_id', query_params.user_id);
    }

    const sort_by = query_params.sort_by || 'created_at';
    const order = query_params.order || 'desc';
    const ascending = order === 'asc';

    const cursor_conditions = parse_cursor_query(query_params.cursor, sort_by, ascending);
    query_builder = apply_cursor_conditions(query_builder, cursor_conditions);

    query_builder = query_builder.order(sort_by, { ascending }).limit(query_params.limit + 1);

    const { data, error } = await query_builder;

    if (error) {
      throw new Error(`Failed to fetch reactions: ${this.get_error_message(error)}`);
    }

    return build_cursor_response(data as Reaction[], query_params.limit, sort_by);
  }

  async create(create_reaction_dto: CreateReactionDto): Promise<Reaction> {
    const { data, error } = await this.supabase
      .from('reactions')
      .insert(create_reaction_dto)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          'Reaction already exists for this comment, user, and reaction type',
        );
      }
      throw new Error(`Failed to create reaction: ${this.get_error_message(error)}`);
    }

    return data as Reaction;
  }

  async update(id: string, update_reaction_dto: UpdateReactionDto): Promise<Reaction> {
    const { data, error } = await this.supabase
      .from('reactions')
      .update(update_reaction_dto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          'Reaction already exists for this comment, user, and reaction type',
        );
      }
      throw new Error(`Failed to update reaction: ${this.get_error_message(error)}`);
    }

    if (!data) {
      throw new NotFoundException(`Reaction with id ${id} not found`);
    }

    return data as Reaction;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from('reactions').delete().eq('id', id);

    if (error) {
      throw new NotFoundException(`Reaction with id ${id} not found`);
    }
  }
}
