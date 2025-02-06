import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailTokens, User } from '../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, EmailTokens])
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
