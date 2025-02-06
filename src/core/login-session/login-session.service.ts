import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { LoginSession, User } from '../entities';

@Injectable()
export class LoginSessionService {

  constructor(
    @InjectRepository(LoginSession) private readonly loginSessionRepository: Repository<LoginSession>
  ) {}

  public async generateSessionLoginId(user: User) {
    try {

      const isLoginSessionIdExists = this.loginSessionRepository.findOne({
        where: {
          user: user
        }
      });

      if (isLoginSessionIdExists) {
        await this.loginSessionRepository.delete({
          user: user
        });
      } 

      const loginSessionId = uuidv4();
      const expiresAt = new Date();
  
      const hashedLoginSessionId = await bcrypt.hash(loginSessionId, 10);
  
      expiresAt.setMinutes(expiresAt.getMinutes() + 5);

      const newLoginSessionId = {
        loginSessionId: hashedLoginSessionId,
        expiresAt,
        user
      }

      const createLoginSessionId = this.loginSessionRepository.create(newLoginSessionId);

      await this.loginSessionRepository.save(createLoginSessionId);

      return loginSessionId;     
    } catch(err) {
      throw new BadRequestException('Cannot generate login session id');
    }
  }

  public async validateLoginSessionId(loginSessionId: string) {
    try {
      const sessions = await this.loginSessionRepository.find({
        where: { expiresAt: MoreThan(new Date()) },
        relations: ['user']
      });

      for (const session of sessions) {
        const isMatch = await bcrypt.compare(loginSessionId, session.loginSessionId);

        if (isMatch) {
          return session.user;
        }
      }

      throw new BadRequestException('Session Expired');
    } catch(err) {
      throw new BadRequestException('Session Expired');
    }
  }

  public async removeLoginSessionId(user: User) {
    try {
      return await this.loginSessionRepository.delete({
        user: user
      });
    } catch(err) {      
      throw new BadRequestException('Cannot remove loign session');
    }
  }
}
