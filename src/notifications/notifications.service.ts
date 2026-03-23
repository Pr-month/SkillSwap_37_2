import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { RequestStatus } from 'src/requests/requests.enums';

@Injectable()
export class NotificationsService {
  constructor(private gateway: NotificationsGateway) {}

  notifyUserRequestStatus(
    userId: string,
    requestID: string,
    newStatus: RequestStatus,
  ) {
    this.gateway.sendNotification(userId, {
      requestID,
      newStatus,
      time: Date.now(),
    });
  }
}
