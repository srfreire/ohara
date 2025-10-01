import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { get_supabase_client } from '../../../lib/supabase.client';
import { CreateItemDto, Item } from '../models/item.model';

@Injectable()
export class ItemsService {
  private supabase = get_supabase_client();

  async find_by_collection_id(collection_id: string): Promise<Item[]> {
    const { data, error } = await this.supabase
      .from('items')
      .select('*')
      .eq('collection_id', collection_id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch items: ${error.message}`);
    }

    return data as Item[];
  }

  async create(
    collection_id: string,
    create_item_dto: CreateItemDto,
  ): Promise<Item> {
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
