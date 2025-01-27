export class AuthRequest {
  readonly user: {
    readonly id: number;
    readonly email: string;
    readonly emailVerified: boolean;
    readonly tfa: boolean;
  }
}