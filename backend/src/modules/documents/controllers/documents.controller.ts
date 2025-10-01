<<<<<<< HEAD
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
=======
import { Controller, Get, Param, Query, UseGuards, Logger } from '@nestjs/common';
import { DocumentsService } from '../services/documents.service';
import { QueryDocumentsDto } from '../models/document.model';
import { ApiKeyOrJwtGuard } from '../../auth/guards/api-key-or-jwt.guard';

@Controller('documents')
@UseGuards(ApiKeyOrJwtGuard)
export class DocumentsController {
  private readonly logger = new Logger('DocumentsController');

  constructor(private readonly documents_service: DocumentsService) {}

  @Get()
  async find_all(@Query() query_params: QueryDocumentsDto) {
    this.logger.log(`📄 Fetching documents - Params: ${JSON.stringify(query_params)}`);
    const documents = await this.documents_service.find_all(query_params);
    this.logger.log(`✅ Returned ${documents.length} documents`);
    return documents;
>>>>>>> 36ce4a2c21f085454ab03d092b1e2523ae5e85f9
  }

  @Get(':id')
  async find_by_id(@Param('id') id: string) {
    return this.documents_service.find_by_id(id);
  }
}
