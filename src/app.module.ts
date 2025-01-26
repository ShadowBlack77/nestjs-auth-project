import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailTokens, LoginSession, User } from './entities';
import { MailsModule } from './mails/mails.module';
import { LoginSessionModule } from './login-session/login-session.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true
    }),
    TypeOrmModule.forRoot({
      url: process.env.DB_URL,
      type: "postgres",
      port: +process.env.PORT,
      entities: [User, EmailTokens, LoginSession],
      synchronize: true,
    }),
    UserModule, 
    AuthModule, MailsModule, LoginSessionModule
  ],
})
export class AppModule {}
