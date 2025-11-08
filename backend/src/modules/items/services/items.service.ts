import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';

import { get_supabase_client } from '../../../lib/supabase.client';
import { CreateItemDto, Item, QueryItemsDto } from '../models/item.model';
import {
  parse_cursor_query,
  apply_cursor_conditions,
  build_cursor_response,
  CursorPaginatedResponse,
} from '../../../common/pagination';

@Injectable()
export class ItemsService {
  private supabase = get_supabase_client();

  async find_by_collection_id(
    collection_id: string,
    query_params: QueryItemsDto,
  ): Promise<CursorPaginatedResponse<Item> | Item[]> {
    let query_builder = this.supabase.from('items').select('*').eq('collection_id', collection_id);

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
        throw new Error(`Failed to fetch items: ${error.message}`);
      }

      return build_cursor_response(data as Item[], query_params.limit, sort_by);
    } else {
      // Offset-based pagination
      query_builder = query_builder
        .order(sort_by, { ascending })
        .range(query_params.offset, query_params.offset + query_params.limit - 1);

      const { data, error } = await query_builder;

      if (error) {
        throw new Error(`Failed to fetch items: ${error.message}`);
      }

      // For offset pagination, return raw array for backwards compatibility
      // TODO: Consider wrapping offset responses too for consistency
      return data as Item[];
    }
  }

  async create(collection_id: string, create_item_dto: CreateItemDto): Promise<Item> {
    const { data, error } = await this.supabase
      .from('items')
      .insert({
        collection_id,
        document_id: create_item_dto.document_id,
      })
      .select()
      .single();

    if (error) {
      // Check for unique constraint violation
      if (error.code === '23505') {
        throw new ConflictException('Item already exists in this collection');
      }
      throw new Error(`Failed to create item: ${error.message}`);
    }

    return data as Item;
  }

  async delete(collection_id: string, item_id: string): Promise<void> {
    const { error } = await this.supabase
      .from('items')
      .delete()
      .eq('id', item_id)
      .eq('collection_id', collection_id);

    if (error) {
      throw new NotFoundException(`Item with id ${item_id} not found in collection`);
    }
  }
}
