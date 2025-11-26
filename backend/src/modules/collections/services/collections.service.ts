import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';

import { get_supabase_client } from '../../../lib/supabase.client';
import {
  CreateCollectionDto,
  UpdateCollectionDto,
  Collection,
  QueryCollectionsDto,
} from '../models/collection.model';
import {
  parse_cursor_query,
  apply_cursor_conditions,
  build_cursor_response,
  CursorPaginatedResponse,
} from '../../../common/pagination/index';

@Injectable()
export class CollectionsService {
  private supabase = get_supabase_client();

  async find_all(query_params: QueryCollectionsDto): Promise<CursorPaginatedResponse<Collection>> {
    let query_builder = this.supabase.from('collections').select('*');

    if (query_params.user_id) {
      query_builder = query_builder.or(
        `user_id.eq.${query_params.user_id},visibility.in.(public,unlisted)`,
      );
    } else {
      query_builder = query_builder.in('visibility', ['public', 'unlisted']);
    }

    const sort_by = query_params.sort_by || 'created_at';
    const order = query_params.order || 'desc';
    const ascending = order === 'asc';

    const cursor_conditions = parse_cursor_query(query_params.cursor, sort_by, ascending);
    query_builder = apply_cursor_conditions(query_builder, cursor_conditions);

    query_builder = query_builder.order(sort_by, { ascending }).limit(query_params.limit + 1);

    const { data, error } = await query_builder;

    if (error) {
      throw new Error(`Failed to fetch collections: ${error.message}`);
    }

    return build_cursor_response(data as Collection[], query_params.limit, sort_by);
  }

  async find_by_id(id: string, user_id?: string): Promise<Collection> {
    const { data, error } = await this.supabase
      .from('collections')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Collection with id ${id} not found`);
    }

    const collection = data as Collection;

    if (collection.visibility === 'private' && collection.user_id !== user_id) {
      throw new ForbiddenException('You do not have access to this collection');
    }

    return collection;
  }

  async create(create_collection_dto: CreateCollectionDto): Promise<Collection> {
    const { data, error } = await this.supabase
      .from('collections')
      .insert(create_collection_dto)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create collection: ${error.message}`);
    }

    return data as Collection;
  }

  async update(
    id: string,
    user_id: string,
    update_collection_dto: UpdateCollectionDto,
  ): Promise<Collection> {
    const collection = await this.find_by_id(id, user_id);

    if (collection.user_id !== user_id) {
      throw new ForbiddenException('You do not have permission to update this collection');
    }

    const { data, error } = await this.supabase
      .from('collections')
      .update(update_collection_dto)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException(`Collection with id ${id} not found`);
    }

    return data as Collection;
  }

  async delete(id: string, user_id: string): Promise<void> {
    const collection = await this.find_by_id(id, user_id);

    if (collection.user_id !== user_id) {
      throw new ForbiddenException('You do not have permission to delete this collection');
    }

    const { error } = await this.supabase.from('collections').delete().eq('id', id);

    if (error) {
      throw new NotFoundException(`Collection with id ${id} not found`);
    }
  }
}
