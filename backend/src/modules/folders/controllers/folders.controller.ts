import { Controller, Get, Post, Put, Delete, Param, Query, Body, UsePipes, UseGuards, Logger } from '@nestjs/common';
import { FoldersService } from '../services/folders.service';
import { QueryFoldersDto, CreateFolderDto, UpdateFolderDto, create_folder_schema, update_folder_schema } from '../models/folder.model';
import { ZodValidationPipe } from '../../../common/validation/zod-validation.pipe';
import { ApiKeyOrJwtGuard } from '../../auth/guards/api-key-or-jwt.guard';

@Controller('folders')
@UseGuards(ApiKeyOrJwtGuard)
export class FoldersController {
  private readonly logger = new Logger('FoldersController');

  constructor(private readonly folders_service: FoldersService) {}

  @Get()
  async find_all(@Query() query_params: QueryFoldersDto) {
    this.logger.log(`📂 Fetching folders - Params: ${JSON.stringify(query_params)}`);
    const folders = await this.folders_service.find_all(query_params);
    this.logger.log(`✅ Returned ${folders.length} folders`);
    return folders;
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
    return { message: 'Folder deleted successfully' };
  }
}
