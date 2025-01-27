import { PickType } from "@nestjs/mapped-types";
import { ChangePasswordRequest } from "./change-password.request";

export class ChangePasswordDto extends PickType(ChangePasswordRequest, [
  'newPassword'
] as const) {}