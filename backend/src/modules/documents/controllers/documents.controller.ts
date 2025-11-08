import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiSecurity,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { ZodValidationPipe } from '../../../common/validation/zod-validation.pipe';
import { ApiKeyOrJwtGuard } from '../../auth/guards/api-key-or-jwt.guard';
import { DocumentsService } from '../services/documents.service';
import { QueryDocumentsDto, query_documents_schema } from '../models/document.model';

@ApiTags('documents')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('api-key')
@Controller('v2/documents')
@UseGuards(ApiKeyOrJwtGuard)
export class DocumentsController {
  constructor(private readonly documents_service: DocumentsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all documents',
    description: 'Retrieve documents with search, filtering, sorting, and cursor-based pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (1-100, default: 25)',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    type: String,
    description: 'Base64 encoded cursor for cursor-based pagination',
  })
  @ApiQuery({
    name: 'folder_id',
    required: false,
    type: String,
    description: 'Filter by folder UUID',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search documents by title (case-insensitive)',
  })
  @ApiQuery({
    name: 'created_after',
    required: false,
    type: String,
    description: 'Filter by creation date (ISO 8601)',
  })
  @ApiQuery({
    name: 'created_before',
    required: false,
    type: String,
    description: 'Filter by creation date (ISO 8601)',
  })
  @ApiQuery({
    name: 'sort_by',
    required: false,
    enum: ['created_at', 'title', 'updated_at'],
    description: 'Sort by field (default: created_at)',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order (default: desc)',
  })
  @ApiResponse({ status: 200, description: 'List of documents' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async find_all(
    @Query(new ZodValidationPipe(query_documents_schema)) query_params: QueryDocumentsDto,
  ) {
    return this.documents_service.find_all(query_params);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get document by ID',
    description: "Retrieve a specific document's metadata",
  })
  @ApiParam({ name: 'id', type: String, description: 'Document UUID' })
  @ApiResponse({ status: 200, description: 'Document details' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async find_by_id(@Param('id') id: string) {
    return this.documents_service.find_by_id(id);
  }

  @Get(':id/url')
  @ApiOperation({
    summary: 'Get document signed URL',
    description: 'Generate a signed URL to access the PDF file (expires in 1 hour)',
  })
  @ApiParam({ name: 'id', type: String, description: 'Document UUID' })
  @ApiResponse({
    status: 200,
    description: 'Signed URL generated',
    schema: { example: { url: 'https://...', expires_in: 3600 } },
  })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async get_document_url(@Param('id') id: string) {
    return this.documents_service.get_document_signed_url(id);
  }
}
