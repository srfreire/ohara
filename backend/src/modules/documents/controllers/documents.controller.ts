import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { DocumentsService } from '../services/documents.service';
import { QueryDocumentsDto, query_documents_schema } from '../models/document.model';
import { ApiKeyGuard } from '../../auth/guards/api-key.guard';
import { ZodValidationPipe } from '../../../common/validation/zod-validation.pipe';

@Controller('documents')
@UseGuards(ApiKeyGuard)
export class DocumentsController {
  constructor(private readonly documents_service: DocumentsService) {}

  @Get()
  async find_all(@Query(new ZodValidationPipe(query_documents_schema)) query_params: QueryDocumentsDto) {
    return this.documents_service.find_all(query_params);
  }

  @Get(':id')
  async find_by_id(@Param('id') id: string) {
    return this.documents_service.find_by_id(id);
  }
}
