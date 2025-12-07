import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UsePipes,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ZodValidationPipe } from '../../../common/validation/zod-validation.pipe';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CollectionsService } from '../services/collections.service';
import {
  create_collection_schema,
  update_collection_schema,
  query_collections_schema,
  CreateCollectionDto,
  UpdateCollectionDto,
  QueryCollectionsDto,
} from '../models/collection.model';

@ApiTags('collections')
@Controller('v2/collections')
@UseGuards(JwtAuthGuard)
export class CollectionsController {
  constructor(private readonly collections_service: CollectionsService) {}

  @Get()
  async find_all(
    @Query(new ZodValidationPipe(query_collections_schema)) query_params: QueryCollectionsDto,
    @Req() req: any,
  ) {
    const user_id = req.user?.id;
    return this.collections_service.find_all({ ...query_params, user_id });
  }

  @Get(':id')
  async find_by_id(@Param('id') id: string, @Req() req: any) {
    const user_id = req.user?.id;
    return this.collections_service.find_by_id(id, user_id);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(create_collection_schema))
  async create(@Body() create_collection_dto: CreateCollectionDto) {
    return this.collections_service.create(create_collection_dto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(update_collection_schema))
    update_collection_dto: UpdateCollectionDto,
    @Req() req: any,
  ) {
    const user_id = req.user.id;
    return this.collections_service.update(id, user_id, update_collection_dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    const user_id = req.user.id;
    await this.collections_service.delete(id, user_id);
    return { data: null, message: 'Collection deleted successfully' };
  }
}
