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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiSecurity,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

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
@ApiBearerAuth('JWT-auth')
@ApiSecurity('api-key')
@Controller('v2/folders')
@UseGuards(ApiKeyOrJwtGuard)
export class FoldersController {
  constructor(private readonly folders_service: FoldersService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all folders',
    description: 'Retrieve folders with pagination. Supports hierarchical structure via parent_id.',
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
    name: 'parent_id',
    required: false,
    type: String,
    description: 'Filter by parent folder UUID (null for root folders)',
  })
  @ApiResponse({ status: 200, description: 'List of folders' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async find_all(
    @Query(new ZodValidationPipe(query_folders_schema)) query_params: QueryFoldersDto,
  ) {
    return this.folders_service.find_all(query_params);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get folder by ID', description: 'Retrieve a specific folder' })
  @ApiParam({ name: 'id', type: String, description: 'Folder UUID' })
  @ApiResponse({ status: 200, description: 'Folder details' })
  @ApiResponse({ status: 404, description: 'Folder not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async find_by_id(@Param('id') id: string) {
    return this.folders_service.find_by_id(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a folder',
    description: 'Create a new folder. Can be nested by specifying parent_id.',
  })
  @ApiBody({
    description: 'Folder data',
    schema: { example: { name: 'Documents', parent_id: null } },
  })
  @ApiResponse({ status: 201, description: 'Folder created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UsePipes(new ZodValidationPipe(create_folder_schema))
  async create(@Body() create_folder_dto: CreateFolderDto) {
    return this.folders_service.create(create_folder_dto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a folder',
    description: 'Update an existing folder (full update)',
  })
  @ApiParam({ name: 'id', type: String, description: 'Folder UUID' })
  @ApiBody({
    description: 'Updated folder data',
    schema: { example: { name: 'New Name', parent_id: 'uuid' } },
  })
  @ApiResponse({ status: 200, description: 'Folder updated successfully' })
  @ApiResponse({ status: 404, description: 'Folder not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UsePipes(new ZodValidationPipe(update_folder_schema))
  async update(@Param('id') id: string, @Body() update_folder_dto: UpdateFolderDto) {
    return this.folders_service.update(id, update_folder_dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a folder', description: 'Remove a folder' })
  @ApiParam({ name: 'id', type: String, description: 'Folder UUID' })
  @ApiResponse({ status: 200, description: 'Folder deleted successfully' })
  @ApiResponse({ status: 404, description: 'Folder not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async delete(@Param('id') id: string) {
    await this.folders_service.delete(id);
    return { data: null, message: 'Folder deleted successfully' };
  }
}
