import { Injectable, NotFoundException, Logger } from '@nestjs/common';

import { get_supabase_client } from '../../../lib/supabase.client';
import { Folder, QueryFoldersDto, CreateFolderDto, UpdateFolderDto } from '../models/folder.model';
import {
  parse_cursor_query,
  apply_cursor_conditions,
  build_cursor_response,
  CursorPaginatedResponse,
} from '../../../common/pagination';

@Injectable()
export class FoldersService {
  private readonly logger = new Logger('FoldersService');
  private supabase = get_supabase_client();

  async find_all(query_params: QueryFoldersDto): Promise<CursorPaginatedResponse<Folder>> {
    let query_builder = this.supabase.from('folders').select('*');

    if (query_params.parent_id) {
      query_builder = query_builder.eq('parent_id', query_params.parent_id);
    }

    const sort_by = query_params.sort_by || 'created_at';
    const order = query_params.order || 'desc';
    const ascending = order === 'asc';

    const cursor_conditions = parse_cursor_query(query_params.cursor, sort_by, ascending);
    query_builder = apply_cursor_conditions(query_builder, cursor_conditions);

    query_builder = query_builder.order(sort_by, { ascending }).limit(query_params.limit + 1);

    const { data, error } = await query_builder;

    if (error) {
      this.logger.error(`Supabase error: ${error.message}`, error);
      throw new Error(`Failed to fetch folders: ${error.message}`);
    }

    return build_cursor_response(data as Folder[], query_params.limit, sort_by);
  }

  async find_by_id(id: string): Promise<Folder> {
    const { data, error } = await this.supabase.from('folders').select('*').eq('id', id).single();

    if (error || !data) {
      throw new NotFoundException(`Folder with id ${id} not found`);
    }

    return data as Folder;
  }

  async create(create_folder_dto: CreateFolderDto): Promise<Folder> {
    const { data, error } = await this.supabase
      .from('folders')
      .insert([create_folder_dto])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create folder: ${error.message}`);
    }

    return data as Folder;
  }

  async update(id: string, update_folder_dto: UpdateFolderDto): Promise<Folder> {
    const { data, error } = await this.supabase
      .from('folders')
      .update(update_folder_dto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update folder: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Folder with id ${id} not found`);
    }

    return data as Folder;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from('folders').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete folder: ${error.message}`);
    }
  }
}
