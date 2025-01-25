import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailTokens, User } from 'src/entities';
import { MailsService } from 'src/mails/mails.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, EmailTokens])
  ],
  controllers: [UserController],
  providers: [UserService, MailsService],
})
export class UserModule {}
