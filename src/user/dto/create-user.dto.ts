import { IsEmail, IsOptional, IsString, IsUrl } from "class-validator";

export class CreateUserDto {

  @IsString()
  readonly username: string;

  @IsString()
  @IsEmail()
  readonly email: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  readonly avatarUrl: string;

  @IsString()
  readonly password: string
}