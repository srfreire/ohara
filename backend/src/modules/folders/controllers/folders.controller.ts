import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UsePipes,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ZodValidationPipe } from '../../../common/validation/zod-validation.pipe';
import { ApiKeyOrJwtGuard } from '../../auth/guards/api-key-or-jwt.guard';
import { FoldersService } from '../services/folders.service';
import {
  QueryFoldersDto,
  CreateFolderDto,
  UpdateFolderDto,
  create_folder_schema,
  update_folder_schema,
  query_folders_schema,
} from '../models/folder.model';

@ApiTags('folders')
@Controller('v2/folders')
@UseGuards(ApiKeyOrJwtGuard)
export class FoldersController {
  constructor(private readonly folders_service: FoldersService) {}

  @Get()
  async find_all(
    @Query(new ZodValidationPipe(query_folders_schema)) query_params: QueryFoldersDto,
  ) {
    return this.folders_service.find_all(query_params);
  }

  @Get(':id')
  async find_by_id(@Param('id') id: string) {
    return this.folders_service.find_by_id(id);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(create_folder_schema))
  async create(@Body() create_folder_dto: CreateFolderDto) {
    return this.folders_service.create(create_folder_dto);
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(update_folder_schema))
  async update(@Param('id') id: string, @Body() update_folder_dto: UpdateFolderDto) {
    return this.folders_service.update(id, update_folder_dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.folders_service.delete(id);
    return { data: null, message: 'Folder deleted successfully' };
  }
}
