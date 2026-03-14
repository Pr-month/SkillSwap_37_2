import { Inject, UseGuards } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from 'src/auth/guards/ws-gwt-acces.guard';
import { appConfig, IConfig } from 'src/config/app.config';


@WebSocketGateway({
  namespace: 'notifications',
})
export class NotificationsGateway{

  constructor(
    @Inject(appConfig.KEY)
    private readonly config: IConfig,
  ){
    // this.updateCorsConfig();
  }

  afterInit(server: Server) {
    const corsOrigin = this.config.cors.origin || '*';

    if (server.engine && server.engine.opts) {
      server._opts.cors = {
        origin: corsOrigin,
        credentials: true
      }      
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
    @ConnectedSocket() client: Socket
  ): void {
    const sockets = this.userSockets.get(userId) || [];
    sockets.push(client.id);
    this.userSockets.set(userId, sockets);
    
    console.log(`User ${userId} registered with socket ${client.id}`);
  }

  @SubscribeMessage('disconnect')
  handleDisconnect(@ConnectedSocket() client: Socket): void {
    for (const [userId, sockets] of this.userSockets.entries()) {
      const index = sockets.indexOf(client.id);
      if (index !== -1) {
        sockets.splice(index, 1);
        if (sockets.length === 0) {
          this.userSockets.delete(userId);
        }
        break;
      }
    }
  }

  @SubscribeMessage('notification')
  sendNotification(userId: string, payload: any) {
    this.server.to(userId).emit('notification', payload);
  }

}
