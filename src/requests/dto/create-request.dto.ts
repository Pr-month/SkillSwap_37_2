import {IsString, IsNotEmpty, IsUUID} from 'class-validator';

export class CreateRequestDto {
    @IsUUID()
    senderId: string;

    @IsUUID()
    receiverId: string;

    @IsUUID()
    offeredSkillId: string;

    @IsUUID()
    requestedSkillId: string;
}