import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';

import { ZodValidationPipe } from '../../../common/validation/zod-validation.pipe';
import { ApiKeyOrJwtGuard } from '../../auth/guards/api-key-or-jwt.guard';
import { DocumentsService } from '../services/documents.service';
import { QueryDocumentsDto, query_documents_schema } from '../models/document.model';

@Controller('documents')
@UseGuards(ApiKeyOrJwtGuard)
export class DocumentsController {
  constructor(private readonly documents_service: DocumentsService) {}

  @Get()
  async find_all(
    @Query(new ZodValidationPipe(query_documents_schema)) query_params: QueryDocumentsDto,
  ) {
    return this.documents_service.find_all(query_params);
  }

  @Get(':id')
  async find_by_id(@Param('id') id: string) {
    return this.documents_service.find_by_id(id);
  }

  @Get(':id/url')
  async get_document_url(@Param('id') id: string) {
    return this.documents_service.get_document_signed_url(id);
  }
}
