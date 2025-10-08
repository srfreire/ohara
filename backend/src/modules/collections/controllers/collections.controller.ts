import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UsePipes,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ZodValidationPipe } from '../../../common/validation/zod-validation.pipe';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CollectionsService } from '../services/collections.service';
import {
  create_collection_schema,
  update_collection_schema,
  CreateCollectionDto,
  UpdateCollectionDto,
} from '../models/collection.model';

@Controller('collections')
@UseGuards(JwtAuthGuard)
export class CollectionsController {
  constructor(private readonly collections_service: CollectionsService) {}

  @Get()
  async find_all(@Req() req: any) {
    const user_id = req.user?.id;
    return this.collections_service.find_all(user_id);
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
  @UsePipes(new ZodValidationPipe(update_collection_schema))
  async update(
    @Param('id') id: string,
    @Body() update_collection_dto: UpdateCollectionDto,
    @Req() req: any,
  ) {
    const user_id = req.user.id;
    return this.collections_service.update(id, user_id, update_collection_dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    const user_id = req.user.id;
    await this.collections_service.delete(id, user_id);
    return { message: 'Collection deleted successfully' };
  }
}
