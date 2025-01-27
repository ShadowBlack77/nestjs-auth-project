import { PickType } from "@nestjs/mapped-types";
import { TfaRequest } from "./tfa.request";

export class TfaDto extends PickType(TfaRequest, [
  'code',
  'loginSessionId'
] as const) {}