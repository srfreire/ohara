import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { get_supabase_client } from '../../../lib/supabase.client';
import {
  CreateReactionDto,
  UpdateReactionDto,
  Reaction,
  QueryReactionsDto,
} from '../models/reaction.model';

@Injectable()
export class ReactionsService {
  private supabase = get_supabase_client();

  private get_error_message(error: unknown): string {
    if (error && typeof error === 'object' && 'message' in error) {
      return String(error.message);
    }
    return 'Unknown error';
  }

  async find_all(query_params: QueryReactionsDto): Promise<Reaction[]> {
    let query_builder = this.supabase
      .from('reactions')
      .select('*')
      .order('created_at', { ascending: false })
      .range(query_params.offset, query_params.offset + query_params.limit - 1);

    if (query_params.commentId) {
      query_builder = query_builder.eq('comment_id', query_params.commentId);
    }

    const { data, error } = await query_builder;

    if (error) {
      throw new Error(`Failed to fetch reactions: ${this.get_error_message(error)}`);
    }

    return data as Reaction[];
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

  async update(
    id: string,
    update_reaction_dto: UpdateReactionDto,
  ): Promise<Reaction> {
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

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('reactions')
      .delete()
      .eq('id', id);

    if (error) {
      throw new NotFoundException(`Reaction with id ${id} not found`);
    }
  }
}
