import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUrl,
  MaxDate,
  MinDate,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserGender } from 'src/users/users.enums';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAuthDto {
  @ApiProperty({
    example: 'Иван Иванов',
    description: 'Имя пользователя',
    minLength: 2,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @ApiProperty({
    example: 'ivan@example.com',
    description: 'Email пользователя',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Пароль пользователя',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'Люблю программировать и путешествовать',
    description: 'О себе',
    required: false,
  })
  @IsString()
  //uncomment if required
  // @IsNotEmpty()
  about: string;

  @ApiProperty({
    example: '1990-01-01',
    description: 'Дата рождения',
    type: Date,
    required: false,
  })
  @Type(() => Date)
  @IsDate()
  //uncomment if required
  // @IsNotEmpty()
  @MinDate(new Date('1900-01-01'))
  @MaxDate(new Date())
  birthdate: Date;

  @ApiProperty({
    example: 'Москва',
    description: 'Город проживания',
    minLength: 2,
    required: false,
  })
  @IsString()
  //uncomment if required
  // @IsNotEmpty()
  @MinLength(2)
  city: string;

  @ApiProperty({
    example: UserGender.MALE,
    description: 'Пол',
    enum: UserGender,
    required: false,
  })
  @IsEnum(UserGender)
  //uncomment if required
  // @IsNotEmpty()
  gender: UserGender;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'Ссылка на аватар',
    required: false,
  })
  @IsUrl()
  //uncomment if required
  // @IsNotEmpty()
  avatar: string;
}
