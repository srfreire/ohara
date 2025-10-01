import { Injectable, NotFoundException } from '@nestjs/common';
import { get_supabase_client } from '../../../lib/supabase.client';
import { CreateUserDto, UpdateUserDto, User } from '../models/user.model';

@Injectable()
export class UsersService {
  private supabase = get_supabase_client();

  async find_all(): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    return data as User[];
  }

  async find_by_id(id: string): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

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

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from('users').delete().eq('id', id);

    if (error) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }
}
