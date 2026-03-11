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

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAccessGuard)
  @Get('me')
  getMe(@Request() req: TAuthRequest) {
    return this.usersService.findOne(req.user.sub);
  }

  @UseGuards(JwtAccessGuard)
  @Patch('me/password')
  updatePassword(
    @Request() req: TAuthRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(req.user.sub, changePasswordDto);
  }

  @Get()
  findAll(@Query() getUsersQueryDto: GetUsersQueryDto) {
    return this.usersService.findAll(getUsersQueryDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    return this.usersService.updateProfile(id, updateUserProfileDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}
