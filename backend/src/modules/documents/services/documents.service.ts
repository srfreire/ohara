import { Injectable, NotFoundException } from '@nestjs/common';

import { get_supabase_client } from '../../../lib/supabase.client';
import { Document, QueryDocumentsDto } from '../models/document.model';
import {
  parse_cursor_query,
  apply_cursor_conditions,
  build_cursor_response,
  CursorPaginatedResponse,
} from '../../../common/pagination';

const SIGNED_URL_EXPIRES_IN_SECONDS = 3600;

@Injectable()
export class DocumentsService {
  private supabase = get_supabase_client();

  async find_all(query_params: QueryDocumentsDto): Promise<CursorPaginatedResponse<Document>> {
    let query_builder = this.supabase.from('documents').select('*');

    if (query_params.folder_id) {
      query_builder = query_builder.eq('folder_id', query_params.folder_id);
    }

    if (query_params.search) {
      query_builder = query_builder.ilike('title', `%${query_params.search}%`);
    }

    if (query_params.created_after) {
      query_builder = query_builder.gte('created_at', query_params.created_after);
    }

    if (query_params.created_before) {
      query_builder = query_builder.lte('created_at', query_params.created_before);
    }

    const sort_by = query_params.sort_by || 'created_at';
    const order = query_params.order || 'desc';
    const ascending = order === 'asc';

    const cursor_conditions = parse_cursor_query(query_params.cursor, sort_by, ascending);
    query_builder = apply_cursor_conditions(query_builder, cursor_conditions);

    query_builder = query_builder.order(sort_by, { ascending }).limit(query_params.limit + 1);

    const { data, error } = await query_builder;

    if (error) {
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }

    return build_cursor_response(data as Document[], query_params.limit, sort_by);
  }

  async find_by_id(id: string): Promise<Document> {
    const { data, error } = await this.supabase.from('documents').select('*').eq('id', id).single();

    if (error || !data) {
      throw new NotFoundException(`Document with id ${id} not found`);
    }

    return data as Document;
  }

  async get_document_signed_url(id: string): Promise<{ url: string; expires_in: number }> {
    const document = await this.find_by_id(id);

    const file_path = `${document.id}.pdf`;

    const { data, error } = await this.supabase.storage
      .from('documents')
      .createSignedUrl(file_path, SIGNED_URL_EXPIRES_IN_SECONDS);

    if (error || !data) {
      throw new Error(`Failed to generate signed URL: ${error?.message || 'Unknown error'}`);
    }

    return {
      url: data.signedUrl,
      expires_in: SIGNED_URL_EXPIRES_IN_SECONDS,
    };
  }
}
