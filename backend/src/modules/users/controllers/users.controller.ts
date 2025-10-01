import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UsePipes,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import {
  create_user_schema,
  update_user_schema,
  CreateUserDto,
  UpdateUserDto,
} from '../models/user.model';
import { ZodValidationPipe } from '../../../common/validation/zod-validation.pipe';
import { ApiKeyGuard } from '../../auth/guards/api-key.guard';
import { ApiKeyOrJwtGuard } from '../../auth/guards/api-key-or-jwt.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly users_service: UsersService) {}

  @Get()
  @UseGuards(ApiKeyGuard)
  async find_all() {
    return this.users_service.find_all();
  }

  @Get(':id')
  @UseGuards(ApiKeyGuard)
  async find_by_id(@Param('id') id: string) {
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
  async update(
    @Param('id') id: string,
    @Body() update_user_dto: UpdateUserDto,
    @Req() req: any,
  ) {
    // Allow if admin (API key) or if user is updating themselves
    if (!req.user.is_admin && req.user.id !== id) {
      throw new ForbiddenException('You can only update your own account');
    }
    return this.users_service.update(id, update_user_dto);
  }

  @Delete(':id')
  @UseGuards(ApiKeyOrJwtGuard)
  async delete(@Param('id') id: string, @Req() req: any) {
    // Allow if admin (API key) or if user is deleting themselves
    if (!req.user.is_admin && req.user.id !== id) {
      throw new ForbiddenException('You can only delete your own account');
    }
    await this.users_service.delete(id);
    return { message: 'User deleted successfully' };
  }
}
