import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';

import { get_supabase_client } from '../../../lib/supabase.client';
import {
  CreateReactionDto,
  UpdateReactionDto,
  Reaction,
  QueryReactionsDto,
  ReactionPatchArray,
} from '../models/reaction.model';
import {
  parse_cursor_query,
  apply_cursor_conditions,
  build_cursor_response,
  CursorPaginatedResponse,
} from '../../../common/pagination';

@Injectable()
export class ReactionsService {
  private supabase = get_supabase_client();

  private get_error_message(error: unknown): string {
    if (error && typeof error === 'object' && 'message' in error) {
      return String(error.message);
    }
    return 'Unknown error';
  }

  async find_all(
    query_params: QueryReactionsDto,
  ): Promise<CursorPaginatedResponse<Reaction> | Reaction[]> {
    let query_builder = this.supabase.from('reactions').select('*');

    // Apply filters
    if (query_params.commentId) {
      query_builder = query_builder.eq('comment_id', query_params.commentId);
    }

    if (query_params.reaction_type) {
      query_builder = query_builder.eq('reaction_type', query_params.reaction_type);
    }

    if (query_params.user_id) {
      query_builder = query_builder.eq('user_id', query_params.user_id);
    }

    // Apply sorting
    const sort_by = query_params.sort_by || 'created_at';
    const order = query_params.order || 'desc';
    const ascending = order === 'asc';

    // Apply cursor-based pagination if cursor is provided, otherwise use offset
    if (query_params.cursor) {
      const cursor_conditions = parse_cursor_query(query_params.cursor, sort_by, ascending);
      query_builder = apply_cursor_conditions(query_builder, cursor_conditions);
      // Fetch limit + 1 to check if there are more results
      query_builder = query_builder.order(sort_by, { ascending }).limit(query_params.limit + 1);

      const { data, error } = await query_builder;

      if (error) {
        throw new Error(`Failed to fetch reactions: ${this.get_error_message(error)}`);
      }

      return build_cursor_response(data as Reaction[], query_params.limit, sort_by);
    } else {
      // Offset-based pagination
      query_builder = query_builder
        .order(sort_by, { ascending })
        .range(query_params.offset, query_params.offset + query_params.limit - 1);

      const { data, error } = await query_builder;

      if (error) {
        throw new Error(`Failed to fetch reactions: ${this.get_error_message(error)}`);
      }

      // For offset pagination, return raw array for backwards compatibility
      // TODO: Consider wrapping offset responses too for consistency
      return data as Reaction[];
    }
  }

  async create(create_reaction_dto: CreateReactionDto): Promise<Reaction> {
    const { data, error } = await this.supabase
      .from('reactions')
      .insert(create_reaction_dto)
      .select()
      .single();

    if (error) {
      // Check for unique constraint violation
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
      // Check for unique constraint violation
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

  async patch(id: string, patch_operations: ReactionPatchArray): Promise<Reaction> {
    // First, get the current reaction
    const { data: existing_reaction, error: fetch_error } = await this.supabase
      .from('reactions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetch_error || !existing_reaction) {
      throw new NotFoundException(`Reaction with id ${id} not found`);
    }

    // Apply JSON Patch operations (RFC 6902)
    const updated_reaction = { ...existing_reaction };

    for (const operation of patch_operations) {
      if (operation.op === 'replace') {
        if (operation.path === '/reaction_type') {
          updated_reaction.reaction_type = operation.value;
        }
      }
    }

    // Update the reaction in the database
    const { data, error } = await this.supabase
      .from('reactions')
      .update({ reaction_type: updated_reaction.reaction_type })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      // Check for unique constraint violation
      if (error.code === '23505') {
        throw new ConflictException(
          'Reaction already exists for this comment, user, and reaction type',
        );
      }
      throw new Error(`Failed to patch reaction: ${this.get_error_message(error)}`);
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
