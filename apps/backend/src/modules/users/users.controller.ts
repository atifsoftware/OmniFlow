import { Controller, Get, Put, Delete, Body, Param, Query, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { PaginationQueryDto } from '../../core/common/pagination.dto';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { Roles } from '../../core/decorators/roles.decorator';

@ApiTags('Users & Identity Management')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'List all users with pagination and search (Admin/Manager)' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get profile of current authenticated user' })
  getMyProfile(@CurrentUser('id') userId: string) {
    return this.usersService.findById(userId);
  }

  @Put('profile/password')
  @ApiOperation({ summary: 'Change password for currently authenticated user' })
  changeMyPassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(userId, dto);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Get specific user details by ID (Admin/Manager)' })
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Update user profile (Admin/Manager)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() currentUser: any,
  ) {
    // Prevent modifying own role to prevent privilege escalation or lockout
    if (dto.role !== undefined && currentUser?.id === id) {
      throw new ForbiddenException('Users cannot modify their own role');
    }

    // Only SUPER_ADMIN and ADMIN can change roles or activation status
    if ((dto.role !== undefined || dto.isActive !== undefined) && !['SUPER_ADMIN', 'ADMIN'].includes(currentUser.role)) {
      throw new ForbiddenException('Only Administrators can modify user roles or activation status');
    }

    // Only SUPER_ADMIN can grant the SUPER_ADMIN role
    if (dto.role === 'SUPER_ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only a SUPER_ADMIN can grant the SUPER_ADMIN role');
    }

    return this.usersService.update(id, dto);
  }

  @Put(':id/role')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Change user role (SUPER_ADMIN only)' })
  updateRole(
    @Param('id') id: string,
    @Body('role') role: string,
    @CurrentUser('id') currentUserId: string,
  ) {
    if (id === currentUserId) {
      throw new ForbiddenException('Users cannot modify their own role');
    }
    return this.usersService.update(id, { role } as UpdateUserDto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Deactivate user account (Admin only)' })
  delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
