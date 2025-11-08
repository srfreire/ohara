import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';

import { ZodValidationPipe } from '../../../common/validation/zod-validation.pipe';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ItemsService } from '../services/items.service';
import {
  create_item_schema,
  query_items_schema,
  CreateItemDto,
  QueryItemsDto,
} from '../models/item.model';

@ApiTags('items')
@ApiBearerAuth('JWT-auth')
@Controller('v2/collections/:id/items')
@UseGuards(JwtAuthGuard)
export class ItemsController {
  constructor(private readonly items_service: ItemsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get collection items',
    description:
      'Retrieve all items (documents) in a collection. Supports cursor-based pagination.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Collection UUID' })
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
    name: 'order',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order (default: desc)',
  })
  @ApiResponse({ status: 200, description: 'List of items in the collection' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async find_by_collection_id(
    @Param('id') collection_id: string,
    @Query(new ZodValidationPipe(query_items_schema)) query_params: QueryItemsDto,
  ) {
    return this.items_service.find_by_collection_id(collection_id, query_params);
  }

  @Post()
  @ApiOperation({
    summary: 'Add item to collection',
    description: 'Add a document to a collection',
  })
  @ApiParam({ name: 'id', type: String, description: 'Collection UUID' })
  @ApiBody({ description: 'Item data', schema: { example: { document_id: 'uuid' } } })
  @ApiResponse({ status: 201, description: 'Item added to collection successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Param('id') collection_id: string,
    @Body(new ZodValidationPipe(create_item_schema)) create_item_dto: CreateItemDto,
  ) {
    return this.items_service.create(collection_id, create_item_dto);
  }

  @Delete(':itemId')
  @ApiOperation({
    summary: 'Remove item from collection',
    description: 'Remove a document from a collection',
  })
  @ApiParam({ name: 'id', type: String, description: 'Collection UUID' })
  @ApiParam({ name: 'itemId', type: String, description: 'Item UUID' })
  @ApiResponse({ status: 200, description: 'Item removed from collection successfully' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async delete(@Param('id') collection_id: string, @Param('itemId') item_id: string) {
    await this.items_service.delete(collection_id, item_id);
    return { data: null, message: 'Item deleted successfully' };
  }
}
