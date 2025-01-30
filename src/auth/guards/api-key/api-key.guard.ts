import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {

  private readonly API_KEY = process.env.SECRET_API_KEY;

  canActivate(context: ExecutionContext): boolean {

    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['api-key'];

    if (!apiKey || apiKey !== this.API_KEY) {
      throw new UnauthorizedException('Invalid API Key');
    }

    return true;
  }
}
