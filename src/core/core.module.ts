import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { LoginSessionModule } from './login-session/login-session.module';
import { MailsModule } from './mails/mails.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    AuthModule,
    LoginSessionModule,
    MailsModule,
    UserModule
  ]
})
export class CoreModule {}
