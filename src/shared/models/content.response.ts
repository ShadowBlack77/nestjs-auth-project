import { IsString } from "class-validator";

export class ContentResponse {

  @IsString()
  readonly content: string;
}