import { HttpException, HttpStatus } from '@nestjs/common';

export class OwnerGuardException extends HttpException {
  constructor() {
    super('Request denied by OwnerGuard', HttpStatus.FORBIDDEN);
  }
}