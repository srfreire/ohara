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
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ZodValidationPipe } from '../../../common/validation/zod-validation.pipe';
import { ApiKeyOrJwtGuard } from '../../auth/guards/api-key-or-jwt.guard';
import { ApiKeyGuard } from '../../auth/guards/api-key.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UsersService } from '../services/users.service';
import {
  create_user_schema,
  query_users_schema,
  CreateUserDto,
  UpdateUserDto,
  QueryUsersDto,
} from '../models/user.model';

@ApiTags('users')
@Controller('v2/users')
export class UsersController {
  constructor(private readonly users_service: UsersService) {}

  @Get()
  @UseGuards(ApiKeyOrJwtGuard)
  async find_all(@Query(new ZodValidationPipe(query_users_schema)) query_params: QueryUsersDto) {
    return this.users_service.find_all(query_params);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async find_by_id(@Param('id') id: string, @Req() req: any) {
    // Validar que solo vea su propio perfil
    if (id !== req.user.id) {
      throw new ForbiddenException('You can only view your own profile');
    }
    return this.users_service.find_by_id(id);
  }

  @Post()
  @UseGuards(ApiKeyGuard)
  @UsePipes(new ZodValidationPipe(create_user_schema))
  async create(@Body() create_user_dto: CreateUserDto) {
    return this.users_service.create(create_user_dto);
  }

  @Put(':id')
  @UseGuards(ApiKeyOrJwtGuard)
  async update(@Param('id') id: string, @Body() update_user_dto: UpdateUserDto, @Req() req: any) {
    const is_admin = req.user.is_admin || false;
    const user_id = req.user.id;
    return this.users_service.update(id, update_user_dto, user_id, is_admin);
  }

  @Delete(':id')
  @UseGuards(ApiKeyOrJwtGuard)
  async delete(@Param('id') id: string, @Req() req: any) {
    const is_admin = req.user.is_admin || false;
    const user_id = req.user.id;
    await this.users_service.delete(id, user_id, is_admin);
    return { data: null, message: 'User deleted successfully' };
  }
}
