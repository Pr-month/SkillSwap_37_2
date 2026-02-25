import {IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, IsUrl, MinLength} from 'class-validator';

export class CreateSkillDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(5, {message: 'Название должно быть не короче 5 символов'})
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    @IsNotEmpty()
    category: number;

    @IsArray()
    @IsOptional()
    @IsUrl({}, {each: true})
    images: string[];
}