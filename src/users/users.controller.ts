import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TAuthRequest } from '../auth/auth.types';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UsersService } from './users.service';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiGetMe,
  ApiUpdatePassword,
  ApiUpdateMe,
  ApiFindAllUsers,
  ApiFindOneUser,
  ApiUpdateUser,
  ApiDeleteUser,
  ApiFindUsersBySkill,
} from './users.swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './users.enums';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiGetMe()
  @UseGuards(JwtAccessGuard)
  @Get('me')
  getMe(@Request() req: TAuthRequest) {
    return this.usersService.findOne(req.user.sub);
  }

  @ApiUpdatePassword()
  @UseGuards(JwtAccessGuard)
  @Patch('me/password')
  updatePassword(
    @Request() req: TAuthRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(req.user.sub, changePasswordDto);
  }

  @ApiUpdateMe()
  @UseGuards(JwtAccessGuard)
  @Patch('me')
  updateMe(
    @Request() req: TAuthRequest,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    return this.usersService.updateProfile(req.user.sub, updateUserProfileDto);
  }

  @ApiFindAllUsers()
  @Get()
  findAll(@Query() getUsersQueryDto: GetUsersQueryDto) {
    return this.usersService.findAll(getUsersQueryDto);
  }
  @ApiFindUsersBySkill()
  @Get('by-skill/:id')
  findUsersBySkill(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findUsersBySkill(id);
  }

  @ApiFindOneUser()
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @ApiUpdateUser()
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    return this.usersService.updateProfile(id, updateUserProfileDto);
  }

  @ApiDeleteUser()
  @Delete(':id')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}
