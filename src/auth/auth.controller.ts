import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtAccessGuard } from './guards/jwt-access.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserFromRefreshToken, JwtPayload } from './auth.types';
import { ApiTags } from '@nestjs/swagger';
import { ApiRegister, ApiLogin, ApiRefresh, ApiLogout } from './auth.swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiRegister()
  register(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.register(createAuthDto);
  }

  @Post('login')
  @ApiLogin()
  login(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.login(loginAuthDto);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @ApiRefresh()
  refresh(@CurrentUser() user: UserFromRefreshToken) {
    return this.authService.refresh(user);
  }

  @Post('logout')
  @UseGuards(JwtAccessGuard)
  @ApiLogout()
  logout(@CurrentUser() user: JwtPayload) {
    return this.authService.logout(user.sub);
  }
}
