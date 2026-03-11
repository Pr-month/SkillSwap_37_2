import {Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Request, Req} from '@nestjs/common';
import {RequestsService} from './requests.service';
import {CreateRequestDto} from './dto/create-request.dto';
import {UpdateRequestDto} from './dto/update-request.dto';
import {TAuthRequest} from "../auth/auth.types";

@Controller('requests')
export class RequestsController {
    constructor(private readonly requestsService: RequestsService) {
    }

    @Post()
    create(@Body() createRequestDto: CreateRequestDto) {
        return this.requestsService.create(createRequestDto);
    }

    @Patch(':id')
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateRequestDto: UpdateRequestDto,
        @Request() request: TAuthRequest
    ) {
        return this.requestsService.update(request.user.sub, id, updateRequestDto);
    }

    @Get('incoming')
    async getIncoming(@Request() request: TAuthRequest) {
        return this.requestsService.findIncoming(request.user.sub);
    }

    @Get('outgoing')
    async getOutgoing(@Request() request: TAuthRequest) {
        return this.requestsService.findOutgoing(request.user.sub);
    }
}
