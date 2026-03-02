import { IsDate, IsEmail, IsNotEmpty, IsString, IsUrl, MaxDate, MinDate, MinLength } from 'class-validator';

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

  @IsDate()
  //uncomment if required
  // @IsNotEmpty()
  @MinDate(new Date("1900-01-01"))
  @MaxDate(new Date())
  birthdate : string;

  @IsString()
  //uncomment if required
  // @IsNotEmpty()
  @MinLength(2)
  city: string;

  @IsString()
  //uncomment if required
  // @IsNotEmpty()
  gender: string;

  @IsUrl()
  //uncomment if required
  // @IsNotEmpty()
  avatar: string;

  @IsString()
  //uncomment if required
  // @IsNotEmpty()
  skillCategoryName: string;

  @IsString()
  //uncomment if required
  // @IsNotEmpty()
  skillSubCategoryName: string;
}
