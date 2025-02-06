import { PickType } from "@nestjs/mapped-types";
import { ResetPasswordRequest } from "./reset-password.request";

export class ResetPasswordDto extends PickType(ResetPasswordRequest, [
  'email'
] as const) {}