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
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

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
@Controller('v2/reactions')
@UseGuards(JwtAuthGuard)
export class ReactionsController {
  constructor(private readonly reactions_service: ReactionsService) {}

  @Get()
  async find_all(
    @Query(new ZodValidationPipe(query_reactions_schema)) query_params: QueryReactionsDto,
  ) {
    return this.reactions_service.find_all(query_params);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(create_reaction_schema))
  async create(@Body() create_reaction_dto: CreateReactionDto) {
    return this.reactions_service.create(create_reaction_dto);
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(update_reaction_schema))
  async update(
    @Param('id') id: string,
    @Body() update_reaction_dto: UpdateReactionDto,
    @Req() req: any,
  ) {
    return this.reactions_service.update(id, update_reaction_dto, req.user.id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    await this.reactions_service.delete(id, req.user.id);
    return { data: null, message: 'Reaction deleted successfully' };
  }
}
