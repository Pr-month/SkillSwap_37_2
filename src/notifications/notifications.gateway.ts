import { Inject, UseGuards } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from '../auth/guards/ws-gwt-acces.guard';
import { appConfig, IConfig } from '../config/app.config';

const NOTIFICATIONS_PORT =
  process.env.PORT_NOTIFICATIONS !== undefined
    ? Number(process.env.PORT_NOTIFICATIONS)
    : 0;

@WebSocketGateway(NOTIFICATIONS_PORT, {
  namespace: 'notifications',
})
export class NotificationsGateway {
  constructor(
    @Inject(appConfig.KEY)
    private readonly config: IConfig,
  ) {
    // this.updateCorsConfig();
  }

  afterInit(server: Server) {
    const corsOrigin = this.config.cors.origin || '*';

    if (server.engine && server.engine.opts) {
      server._opts.cors = {
        origin: corsOrigin,
        credentials: true,
      };
    }
  }

  private userSockets: Map<string, string[]> = new Map();

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('Client connected', client.id);
  }

  @SubscribeMessage('register')
  @UseGuards(WsJwtGuard)
  handleRegister(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ): void {
    client.join(userId);
  }

  @SubscribeMessage('disconnect')
  @UseGuards(WsJwtGuard)
  handleDisconnect(
    @ConnectedSocket() client: Socket,
    @MessageBody() userId: string,
  ): void {
    client.leave(userId);
  }

  @SubscribeMessage('notification')
  sendNotification(userId: string, payload: any) {
    this.server.to(userId).emit('notification', payload);
  }
}
