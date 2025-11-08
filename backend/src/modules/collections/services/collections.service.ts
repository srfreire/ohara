import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';

import { get_supabase_client } from '../../../lib/supabase.client';
import {
  CreateCollectionDto,
  UpdateCollectionDto,
  Collection,
  CollectionPatchArray,
  Visibility,
  QueryCollectionsDto,
} from '../models/collection.model';
import {
  parse_cursor_query,
  apply_cursor_conditions,
  build_cursor_response,
  CursorPaginatedResponse,
} from '../../../common/pagination';

@Injectable()
export class CollectionsService {
  private supabase = get_supabase_client();

  async find_all(
    query_params: QueryCollectionsDto,
  ): Promise<CursorPaginatedResponse<Collection> | Collection[]> {
    let query_builder = this.supabase.from('collections').select('*');

    // If user_id is provided, show their collections + public/unlisted
    // If not, show only public/unlisted
    if (query_params.user_id) {
      query_builder = query_builder.or(
        `user_id.eq.${query_params.user_id},visibility.in.(public,unlisted)`,
      );
    } else {
      query_builder = query_builder.in('visibility', ['public', 'unlisted']);
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
        throw new Error(`Failed to fetch collections: ${error.message}`);
      }

      return build_cursor_response(data as Collection[], query_params.limit, sort_by);
    } else {
      // Offset-based pagination
      query_builder = query_builder
        .order(sort_by, { ascending })
        .range(query_params.offset, query_params.offset + query_params.limit - 1);

      const { data, error } = await query_builder;

      if (error) {
        throw new Error(`Failed to fetch collections: ${error.message}`);
      }

      // For offset pagination, return raw array for backwards compatibility
      // TODO: Consider wrapping offset responses too for consistency
      return data as Collection[];
    }
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

    // Check visibility permissions
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
    // First check if collection exists and user owns it
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

  async patch(
    id: string,
    user_id: string,
    patch_operations: CollectionPatchArray,
  ): Promise<Collection> {
    // First check if collection exists and user owns it
    const collection = await this.find_by_id(id, user_id);

    if (collection.user_id !== user_id) {
      throw new ForbiddenException('You do not have permission to update this collection');
    }

    // Apply JSON Patch operations (RFC 6902)
    const updated_collection: any = { ...collection };

    for (const operation of patch_operations) {
      if (operation.op === 'replace') {
        const field = operation.path.substring(1); // Remove leading '/'
        if (field === 'name') {
          updated_collection.name = operation.value as string;
        } else if (field === 'description') {
          updated_collection.description = operation.value as string;
        } else if (field === 'visibility') {
          updated_collection.visibility = operation.value as Visibility;
        }
      }
    }

    // Update the collection in the database
    const { data, error } = await this.supabase
      .from('collections')
      .update({
        name: updated_collection.name,
        description: updated_collection.description,
        visibility: updated_collection.visibility,
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to patch collection: ${error?.message || 'Unknown error'}`);
    }

    return data as Collection;
  }

  async delete(id: string, user_id: string): Promise<void> {
    // First check if collection exists and user owns it
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
