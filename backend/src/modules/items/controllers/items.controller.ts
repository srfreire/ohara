import { Controller, Get, Post, Delete, Param, Body, UsePipes, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

import { ZodValidationPipe } from '../../../common/validation/zod-validation.pipe';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ItemsService } from '../services/items.service';
import { create_item_schema, CreateItemDto } from '../models/item.model';

@ApiTags('items')
@ApiBearerAuth('JWT-auth')
@Controller('collections/:id/items')
@UseGuards(JwtAuthGuard)
export class ItemsController {
  constructor(private readonly items_service: ItemsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get collection items',
    description: 'Retrieve all items (documents) in a collection',
  })
  @ApiParam({ name: 'id', type: String, description: 'Collection UUID' })
  @ApiResponse({ status: 200, description: 'List of items in the collection' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async find_by_collection_id(@Param('id') collection_id: string) {
    return this.items_service.find_by_collection_id(collection_id);
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
    console.log('=== CREATE ITEM REQUEST ===');
    console.log('Collection ID:', collection_id);
    console.log('Raw body:', create_item_dto);
    console.log('Document ID:', create_item_dto.document_id);
    console.log('Document ID type:', typeof create_item_dto.document_id);

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
    return { message: 'Item deleted successfully' };
  }
}
