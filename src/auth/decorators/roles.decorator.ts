import { SetMetadata } from "@nestjs/common";
import { Role } from "../enum";

export const ROLES_KEY = 'ROLES_KEY';
export const Roles = (...roles: [Role, ...Role[]]) => SetMetadata(ROLES_KEY, roles);