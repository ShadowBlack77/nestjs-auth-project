import { Role } from "../enum";

export class AuthRequest {
  readonly user: {
    readonly id: number;
    readonly email: string;
    readonly emailVerified: boolean;
    readonly tfa: boolean;
    readonly role: Role;
  }
}