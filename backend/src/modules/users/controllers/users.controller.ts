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
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiSecurity,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

import { ZodValidationPipe } from '../../../common/validation/zod-validation.pipe';
import { ApiKeyOrJwtGuard } from '../../auth/guards/api-key-or-jwt.guard';
import { UsersService } from '../services/users.service';
import {
  create_user_schema,
  user_patch_array_schema,
  CreateUserDto,
  UpdateUserDto,
  UserPatchArray,
} from '../models/user.model';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('api-key')
@Controller('users')
export class UsersController {
  constructor(private readonly users_service: UsersService) {}

  @Get()
  @UseGuards(ApiKeyOrJwtGuard)
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve all users (admin or authenticated users)',
  })
  @ApiResponse({ status: 200, description: 'List of users' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async find_all() {
    return this.users_service.find_all();
  }

  @Get(':id')
  @UseGuards(ApiKeyOrJwtGuard)
  @ApiOperation({ summary: 'Get user by ID', description: "Retrieve a specific user's profile" })
  @ApiParam({ name: 'id', type: String, description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User details' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async find_by_id(@Param('id') id: string) {
    return this.users_service.find_by_id(id);
  }

  @Post()
  @UseGuards(ApiKeyOrJwtGuard)
  @ApiOperation({
    summary: 'Create a user',
    description: 'Create a new user account (admin or authenticated users)',
  })
  @ApiBody({
    description: 'User data',
    schema: { example: { email: 'user@example.com', name: 'John Doe', avatar_url: 'https://...' } },
  })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UsePipes(new ZodValidationPipe(create_user_schema))
  async create(@Body() create_user_dto: CreateUserDto) {
    return this.users_service.create(create_user_dto);
  }

  @Put(':id')
  @UseGuards(ApiKeyOrJwtGuard)
  @ApiOperation({
    summary: 'Update a user',
    description: 'Update a user account (full update). Requires admin or ownership.',
  })
  @ApiParam({ name: 'id', type: String, description: 'User UUID' })
  @ApiBody({
    description: 'Updated user data',
    schema: { example: { email: 'new@example.com', name: 'Jane Doe' } },
  })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only update own account' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(@Param('id') id: string, @Body() update_user_dto: UpdateUserDto, @Req() req: any) {
    // Allow if admin (API key) or if user is updating themselves
    if (!req.user.is_admin && req.user.id !== id) {
      throw new ForbiddenException('You can only update your own account');
    }
    return this.users_service.update(id, update_user_dto);
  }

  @Patch(':id')
  @UseGuards(ApiKeyOrJwtGuard)
  @ApiOperation({
    summary: 'Patch a user',
    description:
      'Partially update a user using JSON Patch (RFC 6902). Requires admin or ownership.',
  })
  @ApiParam({ name: 'id', type: String, description: 'User UUID' })
  @ApiBody({
    description: 'JSON Patch operations',
    schema: { example: [{ op: 'replace', path: '/name', value: 'New Name' }] },
  })
  @ApiResponse({ status: 200, description: 'User patched successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only update own account' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UsePipes(new ZodValidationPipe(user_patch_array_schema))
  async patch(@Param('id') id: string, @Body() patch_operations: UserPatchArray, @Req() req: any) {
    // Allow if admin (API key) or if user is updating themselves
    if (!req.user.is_admin && req.user.id !== id) {
      throw new ForbiddenException('You can only update your own account');
    }
    return this.users_service.patch(id, patch_operations);
  }

  @Delete(':id')
  @UseGuards(ApiKeyOrJwtGuard)
  @ApiOperation({
    summary: 'Delete a user',
    description: 'Remove a user account. Requires admin or ownership.',
  })
  @ApiParam({ name: 'id', type: String, description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only delete own account' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async delete(@Param('id') id: string, @Req() req: any) {
    // Allow if admin (API key) or if user is deleting themselves
    if (!req.user.is_admin && req.user.id !== id) {
      throw new ForbiddenException('You can only delete your own account');
    }
    await this.users_service.delete(id);
    return { message: 'User deleted successfully' };
  }
}
