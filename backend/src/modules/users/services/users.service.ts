import { Injectable, NotFoundException } from '@nestjs/common';

import { get_supabase_client } from '../../../lib/supabase.client';
import { CreateUserDto, UpdateUserDto, User, UserPatchArray } from '../models/user.model';

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
