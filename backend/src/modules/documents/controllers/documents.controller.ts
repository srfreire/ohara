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
  }

  @Get(':id')
  async find_by_id(@Param('id') id: string) {
    return this.documents_service.find_by_id(id);
  }
}
