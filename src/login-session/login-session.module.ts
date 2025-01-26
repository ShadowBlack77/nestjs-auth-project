import { Module } from '@nestjs/common';
import { LoginSessionService } from './login-session.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginSession } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([LoginSession])],
  providers: [LoginSessionService],
})
export class LoginSessionModule {}
