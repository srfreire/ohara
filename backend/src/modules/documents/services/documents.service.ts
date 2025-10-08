import { Injectable, NotFoundException } from '@nestjs/common';

import { get_supabase_client } from '../../../lib/supabase.client';
import { Document, QueryDocumentsDto } from '../models/document.model';

@Injectable()
export class DocumentsService {
  private supabase = get_supabase_client();

  async find_all(query_params: QueryDocumentsDto): Promise<Document[]> {
    let query_builder = this.supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })
      .range(query_params.offset, query_params.offset + query_params.limit - 1);

    if (query_params.folder_id) {
      query_builder = query_builder.eq('folder_id', query_params.folder_id);
    }

    const { data, error } = await query_builder;

    if (error) {
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }

    return data as Document[];
  }

  async find_by_id(id: string): Promise<Document> {
    const { data, error } = await this.supabase.from('documents').select('*').eq('id', id).single();

    if (error || !data) {
      throw new NotFoundException(`Document with id ${id} not found`);
    }

    return data as Document;
  }

  async get_document_signed_url(id: string): Promise<{ url: string; expires_in: number }> {
    // First, verify the document exists
    const document = await this.find_by_id(id);

    // Generate signed URL for the PDF in the documents bucket
    // The file is stored as {uuid}.pdf in the bucket
    const file_path = `${document.id}.pdf`;
    const expires_in = 3600; // 1 hour in seconds

    const { data, error } = await this.supabase.storage
      .from('documents')
      .createSignedUrl(file_path, expires_in);

    if (error || !data) {
      throw new Error(`Failed to generate signed URL: ${error?.message || 'Unknown error'}`);
    }

    return {
      url: data.signedUrl,
      expires_in: expires_in,
    };
  }
}
