import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities';

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
      entities: [User],
      synchronize: true,
    }),
    UserModule, 
    AuthModule
  ],
})
export class AppModule {}
