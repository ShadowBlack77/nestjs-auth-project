import { PickType } from "@nestjs/mapped-types";
import { UserRequest } from "./user.request";

export class PartialUserDto extends PickType(UserRequest, [
  'user'
] as const) {}