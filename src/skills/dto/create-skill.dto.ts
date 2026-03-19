import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsUrl,
  MinLength,
  IsUUID,
} from 'class-validator';

export class CreateSkillDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Название должно быть не короче 5 символов' })
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsUUID()
  @IsNotEmpty()
  category: string;

  @IsArray()
  @IsOptional()
  @IsUrl({}, { each: true })
  images: string[];
}
