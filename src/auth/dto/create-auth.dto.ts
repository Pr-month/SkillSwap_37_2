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

export class CreateAuthDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  //uncomment if required
  // @IsNotEmpty()
  about: string;

  @Type(() => Date)
  @IsDate()
  //uncomment if required
  // @IsNotEmpty()
  @MinDate(new Date('1900-01-01'))
  @MaxDate(new Date())
  birthdate: Date;

  @IsString()
  //uncomment if required
  // @IsNotEmpty()
  @MinLength(2)
  city: string;

  @IsEnum(UserGender)
  //uncomment if required
  // @IsNotEmpty()
  gender: UserGender;

  @IsUrl()
  //uncomment if required
  // @IsNotEmpty()
  avatar: string;
}
