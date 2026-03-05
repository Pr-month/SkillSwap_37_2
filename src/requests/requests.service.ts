import {Injectable} from '@nestjs/common';
import {CreateRequestDto} from './dto/create-request.dto';
import {UpdateRequestDto} from './dto/update-request.dto';

@Injectable()
export class RequestsService {
    create(createRequestDto: CreateRequestDto) {
        return 'This action adds a new request';
    }

    findAll() {
        return `This action returns all requests`;
    }

    findOne(id: string) {
        return `This action returns a #${id} request`;
    }

    update(id: string, updateRequestDto: UpdateRequestDto) {
        return `This action updates a #${id} request`;
    }

    remove(id: string) {
        return `This action removes a #${id} request`;
    }
}
