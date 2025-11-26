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
import { CommentsService } from '../services/comments.service';
import {
  create_comment_schema,
  update_comment_schema,
  query_comments_schema,
  CreateCommentDto,
  UpdateCommentDto,
  QueryCommentsDto,
} from '../models/comment.model';

@ApiTags('comments')
@ApiBearerAuth('JWT-auth')
@Controller('v2/comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly comments_service: CommentsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all comments',
    description:
      'Retrieve comments with filtering, sorting, and pagination (offset or cursor-based). Supports threaded comments and text annotations.',
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
    name: 'documentId',
    required: false,
    type: String,
    description: 'Filter by document UUID',
  })
  @ApiQuery({ name: 'user_id', required: false, type: String, description: 'Filter by user UUID' })
  @ApiQuery({
    name: 'parent_comment_id',
    required: false,
    type: String,
    description: 'Filter by parent comment UUID (get replies)',
  })
  @ApiQuery({
    name: 'sort_by',
    required: false,
    enum: ['created_at', 'content'],
    description: 'Sort by field (default: created_at)',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order (default: desc)',
  })
  @ApiResponse({ status: 200, description: 'List of comments' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async find_all(
    @Query(new ZodValidationPipe(query_comments_schema)) query_params: QueryCommentsDto,
  ) {
    return this.comments_service.find_all(query_params);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a comment',
    description:
      'Add a new comment to a document or reply to another comment. Supports text selection offsets for annotations.',
  })
  @ApiBody({
    description: 'Comment data',
    schema: {
      example: {
        user_id: 'uuid',
        document_id: 'uuid',
        content: 'Great point!',
        start_offset: 0,
        end_offset: 100,
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid offsets' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UsePipes(new ZodValidationPipe(create_comment_schema))
  async create(@Body() create_comment_dto: CreateCommentDto) {
    return this.comments_service.create(create_comment_dto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a comment',
    description: 'Update an existing comment',
  })
  @ApiParam({ name: 'id', type: String, description: 'Comment UUID' })
  @ApiBody({
    description: 'Updated comment data',
    schema: { example: { content: 'Updated comment text' } },
  })
  @ApiResponse({ status: 200, description: 'Comment updated successfully' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UsePipes(new ZodValidationPipe(update_comment_schema))
  async update(@Param('id') id: string, @Body() update_comment_dto: UpdateCommentDto) {
    return this.comments_service.update(id, update_comment_dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a comment', description: 'Remove a comment' })
  @ApiParam({ name: 'id', type: String, description: 'Comment UUID' })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async delete(@Param('id') id: string) {
    await this.comments_service.delete(id);
    return { data: null, message: 'Comment deleted successfully' };
  }
}
