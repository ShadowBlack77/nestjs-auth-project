import { IsString } from "class-validator";

export class TfaRequest {

  @IsString()
  readonly code: string;

  @IsString()
  readonly loginSessionId: string;
}