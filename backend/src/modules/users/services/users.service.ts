import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';

import { get_supabase_client } from '../../../lib/supabase.client';
import { CreateUserDto, UpdateUserDto, User, QueryUsersDto } from '../models/user.model';
import {
  parse_cursor_query,
  apply_cursor_conditions,
  build_cursor_response,
  CursorPaginatedResponse,
} from '../../../common/pagination/index';

@Injectable()
export class UsersService {
  private supabase = get_supabase_client();

  async find_all(query_params: QueryUsersDto): Promise<CursorPaginatedResponse<User>> {
    let query_builder = this.supabase.from('users').select('*');

    const sort_by = query_params.sort_by || 'created_at';
    const order = query_params.order || 'desc';
    const ascending = order === 'asc';

    const cursor_conditions = parse_cursor_query(query_params.cursor, sort_by, ascending);
    query_builder = apply_cursor_conditions(query_builder, cursor_conditions);

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

  async update(
    id: string,
    update_user_dto: UpdateUserDto,
    user_id?: string,
    is_admin?: boolean,
  ): Promise<User> {
    if (!is_admin && user_id && id !== user_id) {
      throw new ForbiddenException('You can only update your own account');
    }

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

  async delete(id: string, user_id?: string, is_admin?: boolean): Promise<void> {
    if (!is_admin && user_id && id !== user_id) {
      throw new ForbiddenException('You can only delete your own account');
    }

    const { error } = await this.supabase.from('users').delete().eq('id', id);

    if (error) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }
}
