import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { TAuthRequest } from '../auth/auth.types';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/users.enums';
import {
  ApiCreateRequest,
  ApiDeleteRequest,
  ApiGetIncomingRequests,
  ApiGetOutgoingRequests,
  ApiUpdateStatusRequest,
} from './requests.swagger';

@UseGuards(JwtAccessGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.USER)
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @ApiCreateRequest()
  create(@Body() createRequestDto: CreateRequestDto) {
    return this.requestsService.create(createRequestDto);
  }

  @Patch(':id')
  @ApiUpdateStatusRequest()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRequestDto: UpdateRequestDto,
    @Request() request: TAuthRequest,
  ) {
    return this.requestsService.update(request.user.sub, id, updateRequestDto);
  }

  @Get('incoming')
  @ApiGetIncomingRequests()
  async getIncoming(@Request() request: TAuthRequest) {
    return this.requestsService.findIncoming(request.user.sub);
  }

  @Get('outgoing')
  @ApiGetOutgoingRequests()
  async getOutgoing(@Request() request: TAuthRequest) {
    return this.requestsService.findOutgoing(request.user.sub);
  }

  @Delete('/:id')
  @ApiDeleteRequest()
  async deleteRequest(
    @Request() request: TAuthRequest,
    @Param('id') id: string,
  ) {
    return this.requestsService.delete(request.user, id);
  }
}
