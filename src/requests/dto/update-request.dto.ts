import {PartialType} from '@nestjs/mapped-types';
import {CreateRequestDto} from './create-request.dto';
import {RequestStatus} from "../requests.enums";
import {IsEnum} from "class-validator";

export class UpdateRequestDto extends PartialType(CreateRequestDto) {
    @IsEnum(RequestStatus)
    status: RequestStatus;
}
