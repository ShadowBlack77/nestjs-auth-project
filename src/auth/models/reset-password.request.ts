import { IsEmail, IsString } from "class-validator";

export class ResetPasswordRequest {

  @IsString()
  @IsEmail()
  readonly email: string
}