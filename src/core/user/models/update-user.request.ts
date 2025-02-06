import { PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserRequest extends PickType(CreateUserDto, [
  'avatarUrl',
  'username',
] as const) {}