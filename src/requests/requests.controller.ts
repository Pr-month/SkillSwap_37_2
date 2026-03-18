import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { TAuthRequest } from '../auth/auth.types';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  create(@Body() createRequestDto: CreateRequestDto) {
    return this.requestsService.create(createRequestDto);
  }

  @Patch(':id')
  @UseGuards(JwtAccessGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRequestDto: UpdateRequestDto,
    @Request() request: TAuthRequest,
  ) {
    return this.requestsService.update(request.user.sub, id, updateRequestDto);
  }

  @Get('incoming')
  @UseGuards(JwtAccessGuard)
  async getIncoming(@Request() request: TAuthRequest) {
    return this.requestsService.findIncoming(request.user.sub);
  }

  @Get('outgoing')
  @UseGuards(JwtAccessGuard)
  async getOutgoing(@Request() request: TAuthRequest) {
    return this.requestsService.findOutgoing(request.user.sub);
  }

  @Delete('/:id')
  @UseGuards(JwtAccessGuard)
  async deleteRequest(
    @Request() request: TAuthRequest,
    @Param('id') id: string,
  ) {
    return this.requestsService.delete(request.user, id);
  }
}
