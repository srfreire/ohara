import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';

import { get_supabase_client } from '../../../lib/supabase.client';
import { CreateCollectionDto, UpdateCollectionDto, Collection } from '../models/collection.model';

@Injectable()
export class CollectionsService {
  private supabase = get_supabase_client();

  async find_all(user_id?: string): Promise<Collection[]> {
    let query = this.supabase.from('collections').select('*');

    // If user_id is provided, show their collections + public/unlisted
    // If not, show only public/unlisted
    if (user_id) {
      query = query.or(`user_id.eq.${user_id},visibility.in.(public,unlisted)`);
    } else {
      query = query.in('visibility', ['public', 'unlisted']);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) {
      throw new Error(`Failed to fetch collections: ${error.message}`);
    }

    return data as Collection[];
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
