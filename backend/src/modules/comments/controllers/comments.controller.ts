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

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly comments_service: CommentsService) {}

  @Get()
  async find_all(
    @Query(new ZodValidationPipe(query_comments_schema)) query_params: QueryCommentsDto,
  ) {
    return this.comments_service.find_all(query_params);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(create_comment_schema))
  async create(@Body() create_comment_dto: CreateCommentDto) {
    return this.comments_service.create(create_comment_dto);
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(update_comment_schema))
  async update(@Param('id') id: string, @Body() update_comment_dto: UpdateCommentDto) {
    return this.comments_service.update(id, update_comment_dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.comments_service.delete(id);
    return { message: 'Comment deleted successfully' };
  }
}
