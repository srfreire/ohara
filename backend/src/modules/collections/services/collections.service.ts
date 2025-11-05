import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';

import { get_supabase_client } from '../../../lib/supabase.client';
import {
  CreateCollectionDto,
  UpdateCollectionDto,
  Collection,
  CollectionPatchArray,
  Visibility,
} from '../models/collection.model';

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
