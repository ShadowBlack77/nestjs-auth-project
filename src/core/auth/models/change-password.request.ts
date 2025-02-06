import { IsString } from "class-validator";

export class ChangePasswordRequest {

  @IsString()
  readonly newPassword: string;
}