import { Controller, Get, Post, Delete, Param, Body, UsePipes, UseGuards } from '@nestjs/common';

import { ZodValidationPipe } from '../../../common/validation/zod-validation.pipe';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ItemsService } from '../services/items.service';
import { create_item_schema, CreateItemDto } from '../models/item.model';

@Controller('collections/:id/items')
@UseGuards(JwtAuthGuard)
export class ItemsController {
  constructor(private readonly items_service: ItemsService) {}

  @Get()
  async find_by_collection_id(@Param('id') collection_id: string) {
    return this.items_service.find_by_collection_id(collection_id);
  }

  @Post()
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
  async delete(@Param('id') collection_id: string, @Param('itemId') item_id: string) {
    await this.items_service.delete(collection_id, item_id);
    return { message: 'Item deleted successfully' };
  }
}
