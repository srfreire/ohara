import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  UsePipes,
  Req,
  UseGuards,
} from '@nestjs/common';
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
import { CollectionsService } from '../services/collections.service';
import {
  create_collection_schema,
  update_collection_schema,
  collection_patch_array_schema,
  CreateCollectionDto,
  UpdateCollectionDto,
  CollectionPatchArray,
} from '../models/collection.model';

@ApiTags('collections')
@ApiBearerAuth('JWT-auth')
@Controller('collections')
@UseGuards(JwtAuthGuard)
export class CollectionsController {
  constructor(private readonly collections_service: CollectionsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all collections',
    description:
      "Retrieve collections based on visibility and ownership. Returns user's own collections plus public/unlisted ones.",
  })
  @ApiResponse({ status: 200, description: 'List of collections' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async find_all(@Req() req: any) {
    const user_id = req.user?.id;
    return this.collections_service.find_all(user_id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get collection by ID',
    description: 'Retrieve a specific collection. Private collections require ownership.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Collection UUID' })
  @ApiResponse({ status: 200, description: 'Collection details' })
  @ApiResponse({ status: 404, description: 'Collection not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - No access to private collection' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async find_by_id(@Param('id') id: string, @Req() req: any) {
    const user_id = req.user?.id;
    return this.collections_service.find_by_id(id, user_id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a collection',
    description: 'Create a new collection with private, unlisted, or public visibility',
  })
  @ApiBody({
    description: 'Collection data',
    schema: {
      example: {
        name: 'My Collection',
        user_id: 'uuid',
        description: 'Description',
        visibility: 'private',
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Collection created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UsePipes(new ZodValidationPipe(create_collection_schema))
  async create(@Body() create_collection_dto: CreateCollectionDto) {
    return this.collections_service.create(create_collection_dto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a collection',
    description: 'Update an existing collection (full update). Requires ownership.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Collection UUID' })
  @ApiBody({
    description: 'Updated collection data',
    schema: { example: { name: 'Updated Name', visibility: 'public' } },
  })
  @ApiResponse({ status: 200, description: 'Collection updated successfully' })
  @ApiResponse({ status: 404, description: 'Collection not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the owner' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(update_collection_schema))
    update_collection_dto: UpdateCollectionDto,
    @Req() req: any,
  ) {
    const user_id = req.user.id;
    return this.collections_service.update(id, user_id, update_collection_dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Patch a collection',
    description: 'Partially update a collection using JSON Patch (RFC 6902). Requires ownership.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Collection UUID' })
  @ApiBody({
    description: 'JSON Patch operations',
    schema: { example: [{ op: 'replace', path: '/visibility', value: 'public' }] },
  })
  @ApiResponse({ status: 200, description: 'Collection patched successfully' })
  @ApiResponse({ status: 404, description: 'Collection not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the owner' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UsePipes(new ZodValidationPipe(collection_patch_array_schema))
  async patch(
    @Param('id') id: string,
    @Body() patch_operations: CollectionPatchArray,
    @Req() req: any,
  ) {
    const user_id = req.user.id;
    return this.collections_service.patch(id, user_id, patch_operations);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a collection',
    description: 'Remove a collection. Requires ownership.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Collection UUID' })
  @ApiResponse({ status: 200, description: 'Collection deleted successfully' })
  @ApiResponse({ status: 404, description: 'Collection not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the owner' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async delete(@Param('id') id: string, @Req() req: any) {
    const user_id = req.user.id;
    await this.collections_service.delete(id, user_id);
    return { message: 'Collection deleted successfully' };
  }
}
