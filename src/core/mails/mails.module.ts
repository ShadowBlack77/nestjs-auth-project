import { Module } from '@nestjs/common';
import { MailsService } from './mails.service';
import { MailerModule, MailerService } from '@nestjs-modules/mailer';
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
        host: 'smtp.poczta.onet.pl',
        port: 465,
        secure: true,
        auth: {
          user: 'dogry.bonus@op.pl',
          pass: 'diablo221'
        }
      },
      defaults: {
        from: 'dogry.bonus@op.pl'
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
