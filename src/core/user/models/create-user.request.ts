import { PickType } from "@nestjs/mapped-types";
import { CreateUserDto } from "./create-user.dto";

export class CreateUserRequest extends PickType(CreateUserDto, [
  'username',
  'email',
  'avatarUrl',
  'password',
  'passwordConfirmation',
  'authProvider'
] as const) {} 