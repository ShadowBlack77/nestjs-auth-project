import { Module } from '@nestjs/common';
import { MailsService } from './mails.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailTokens, User } from '../entities';
import { UserService } from '../user/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailTokens, User]),
    MailerModule.forRoot({
      transport: {
        host: process.env.HOST,
        port: +process.env.PORT,
        secure: true,
        auth: {
          user: process.env.USER,
          pass: process.env.PASS
        }
      },
      defaults: {
        from: process.env.FROM
      },
      template: {
        dir: join(__dirname, './templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true
        }
      }
    })
  ],
  providers: [MailsService, UserService],
})
export class MailsModule {}
