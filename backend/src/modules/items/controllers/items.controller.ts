import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

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
@Controller('v2/collections/:id/items')
@UseGuards(JwtAuthGuard)
export class ItemsController {
  constructor(private readonly items_service: ItemsService) {}

  @Get()
  async find_by_collection_id(
    @Param('id') collection_id: string,
    @Query(new ZodValidationPipe(query_items_schema)) query_params: QueryItemsDto,
  ) {
    return this.items_service.find_by_collection_id(collection_id, query_params);
  }

  @Post()
  async create(
    @Param('id') collection_id: string,
    @Body(new ZodValidationPipe(create_item_schema)) create_item_dto: CreateItemDto,
  ) {
    return this.items_service.create(collection_id, create_item_dto);
  }

  @Delete(':itemId')
  async delete(@Param('id') collection_id: string, @Param('itemId') item_id: string) {
    await this.items_service.delete(collection_id, item_id);
    return { data: null, message: 'Item deleted successfully' };
  }
}
