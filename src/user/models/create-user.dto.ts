import { IsEmail, IsEnum, IsOptional, IsString, IsUrl } from "class-validator";
import { AuthProvider } from "src/auth/enum";

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
  readonly password: string;

  @IsEnum(AuthProvider)
  readonly authProvider: AuthProvider;
}