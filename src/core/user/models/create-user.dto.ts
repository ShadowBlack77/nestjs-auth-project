import { IsEmail, IsEnum, IsOptional, IsString, IsUrl, Matches, Min } from "class-validator";
import { AuthProvider } from "src/core/auth/enum";

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

  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  readonly password: string;

  @IsString()
  readonly passwordConfirmation: string;

  @IsEnum(AuthProvider)
  readonly authProvider: AuthProvider;
}