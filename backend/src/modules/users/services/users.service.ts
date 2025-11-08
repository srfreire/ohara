import { Injectable, NotFoundException } from '@nestjs/common';

import { get_supabase_client } from '../../../lib/supabase.client';
import {
  CreateUserDto,
  UpdateUserDto,
  User,
  UserPatchArray,
  QueryUsersDto,
} from '../models/user.model';
import {
  parse_cursor_query,
  apply_cursor_conditions,
  build_cursor_response,
  CursorPaginatedResponse,
} from '../../../common/pagination';

@Injectable()
export class UsersService {
  private supabase = get_supabase_client();

  async find_all(query_params: QueryUsersDto): Promise<CursorPaginatedResponse<User>> {
    let query_builder = this.supabase.from('users').select('*');

    // Apply sorting
    const sort_by = query_params.sort_by || 'created_at';
    const order = query_params.order || 'desc';
    const ascending = order === 'asc';

    // Apply cursor-based pagination
    const cursor_conditions = parse_cursor_query(query_params.cursor, sort_by, ascending);
    query_builder = apply_cursor_conditions(query_builder, cursor_conditions);

    // Fetch limit + 1 to check if there are more results
    query_builder = query_builder.order(sort_by, { ascending }).limit(query_params.limit + 1);

    const { data, error } = await query_builder;

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    return build_cursor_response(data as User[], query_params.limit, sort_by);
  }

  async find_by_id(id: string): Promise<User> {
    const { data, error } = await this.supabase.from('users').select('*').eq('id', id).single();

    if (error || !data) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return data as User;
  }

  async find_by_email(email: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      return null;
    }

    return data as User;
  }

  async create(create_user_dto: CreateUserDto): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .insert(create_user_dto)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return data as User;
  }

  async update(id: string, update_user_dto: UpdateUserDto): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .update(update_user_dto)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return data as User;
  }

  async patch(id: string, patch_operations: UserPatchArray): Promise<User> {
    // First, get the current user
    const { data: existing_user, error: fetch_error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (fetch_error || !existing_user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // Apply JSON Patch operations (RFC 6902)
    const updated_user: any = { ...existing_user };

    for (const operation of patch_operations) {
      if (operation.op === 'replace') {
        const field = operation.path.substring(1); // Remove leading '/'
        if (field === 'email') {
          updated_user.email = operation.value as string;
        } else if (field === 'name') {
          updated_user.name = operation.value as string;
        } else if (field === 'avatar_url') {
          updated_user.avatar_url = operation.value as string | null;
        }
      }
    }

    // Update the user in the database
    const { data, error } = await this.supabase
      .from('users')
      .update({
        email: updated_user.email,
        name: updated_user.name,
        avatar_url: updated_user.avatar_url,
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to patch user: ${error?.message || 'Unknown error'}`);
    }

    return data as User;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from('users').delete().eq('id', id);

    if (error) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }
}
