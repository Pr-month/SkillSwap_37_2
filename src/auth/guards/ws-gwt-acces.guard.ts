import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { IJwtConfig, jwtConfig } from '../../config/jwt.config';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly config: IJwtConfig,
    private jwtService: JwtService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const token = this.extractToken(client);
    if (!token) {
      return false;
    }

    try {
      const payload = this.validateToken(token);
      client.data.user = payload;
      return true;
    } catch (error) {
      return false;
    }
  }

  private extractToken(client: Socket): string | null {
    const authHeader = client.handshake.headers.authorization;

    if (authHeader) {
      const [type, token] = authHeader.split(' ') ?? [];
      return type === 'Bearer' ? token : null;
    }

    return null;
  }

  private async validateToken(token: string) {
    const payload = await this.jwtService.verifyAsync(token, {
      secret: this.config.secret,
    });

    return payload;
  }
}
