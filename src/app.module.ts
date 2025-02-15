import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { CoreModule } from './core/core.module';
import { EmailTokens, LoginSession, User } from './core/entities';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60
    }]),
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
   CoreModule
  ],
})
export class AppModule {}
