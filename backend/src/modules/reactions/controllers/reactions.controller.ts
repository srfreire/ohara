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
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

import { ZodValidationPipe } from '../../../common/validation/zod-validation.pipe';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ReactionsService } from '../services/reactions.service';
import {
  create_reaction_schema,
  update_reaction_schema,
  query_reactions_schema,
  CreateReactionDto,
  UpdateReactionDto,
  QueryReactionsDto,
} from '../models/reaction.model';

@ApiTags('reactions')
@ApiBearerAuth('JWT-auth')
@Controller('v2/reactions')
@UseGuards(JwtAuthGuard)
export class ReactionsController {
  constructor(private readonly reactions_service: ReactionsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all reactions',
    description:
      'Retrieve reactions with filtering, sorting, and pagination (offset or cursor-based)',
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
    name: 'commentId',
    required: false,
    type: String,
    description: 'Filter by comment UUID',
  })
  @ApiQuery({
    name: 'reaction_type',
    required: false,
    enum: ['like', 'love', 'insight', 'question', 'flag'],
    description: 'Filter by reaction type',
  })
  @ApiQuery({ name: 'user_id', required: false, type: String, description: 'Filter by user UUID' })
  @ApiQuery({
    name: 'sort_by',
    required: false,
    enum: ['created_at', 'reaction_type'],
    description: 'Sort by field (default: created_at)',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order (default: desc)',
  })
  @ApiResponse({ status: 200, description: 'List of reactions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async find_all(
    @Query(new ZodValidationPipe(query_reactions_schema)) query_params: QueryReactionsDto,
  ) {
    return this.reactions_service.find_all(query_params);
  }

  @Post()
  @ApiOperation({ summary: 'Create a reaction', description: 'Add a new reaction to a comment' })
  @ApiBody({
    description: 'Reaction data',
    schema: { example: { comment_id: 'uuid', user_id: 'uuid', reaction_type: 'like' } },
  })
  @ApiResponse({ status: 201, description: 'Reaction created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Conflict - Reaction already exists' })
  @UsePipes(new ZodValidationPipe(create_reaction_schema))
  async create(@Body() create_reaction_dto: CreateReactionDto) {
    return this.reactions_service.create(create_reaction_dto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a reaction',
    description: 'Update an existing reaction',
  })
  @ApiParam({ name: 'id', type: String, description: 'Reaction UUID' })
  @ApiBody({ description: 'Updated reaction data', schema: { example: { reaction_type: 'love' } } })
  @ApiResponse({ status: 200, description: 'Reaction updated successfully' })
  @ApiResponse({ status: 404, description: 'Reaction not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Conflict - Reaction already exists with this type' })
  @UsePipes(new ZodValidationPipe(update_reaction_schema))
  async update(@Param('id') id: string, @Body() update_reaction_dto: UpdateReactionDto) {
    return this.reactions_service.update(id, update_reaction_dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a reaction', description: 'Remove a reaction' })
  @ApiParam({ name: 'id', type: String, description: 'Reaction UUID' })
  @ApiResponse({ status: 200, description: 'Reaction deleted successfully' })
  @ApiResponse({ status: 404, description: 'Reaction not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async delete(@Param('id') id: string) {
    await this.reactions_service.delete(id);
    return { data: null, message: 'Reaction deleted successfully' };
  }
}
