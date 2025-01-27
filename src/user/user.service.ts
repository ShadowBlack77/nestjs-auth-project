import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserRequest } from './models';
import { ContentResponse } from 'src/shared/models';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ) {}

  public async create(createUserRequest: any): Promise<ContentResponse> {
    try {

      if (createUserRequest.password !== createUserRequest.repeatPassword) {
        throw new BadRequestException('Passwords are not the same');
      }

      const user = this.userRepository.create(createUserRequest);
      const hashedPassword = await bcrypt.hash(createUserRequest.password, 10);
      const userToSave = { ...user, password: hashedPassword };
  
      await this.userRepository.save(userToSave);
  
      return { content: 'Created' };
    } catch(err) {
      throw new BadRequestException(err.message);
    }
  }

  public async findOne(id: number) {
    return await this.userRepository.findOne({
      where: {
        id
      },
      select: ['id', 'username', 'email', 'avatarUrl', 'role', 'hashedAccessToken', 'hashedRefreshToken', 'tfa', 'tfaSecret', 'authProvider']
    });
  }

  public async getProfile(id: number) {
    return await this.userRepository.findOne({
      where: {
        id
      },
      select: ['id', 'username', 'email', 'avatarUrl', 'role', 'tfa']
    });
  }

  public async update() {

  } 

  public remove(id: number) {

  }

  public async findByEmail(email: string) {
    return await this.userRepository.findOne({
      where: {
        email
      },
      select: ['id', 'username', 'email', 'avatarUrl', 'role', 'hashedAccessToken', 'hashedRefreshToken', 'tfa', 'tfaSecret', 'authProvider', 'password', 'emailVerified']
    });
  }

  public async updateHashedAccessToken(userId: number, hashedAccessToken: string) {
    return await this.userRepository.update({
      id: userId
    }, {
      hashedAccessToken
    });
  }

  public async updateHashedRefreshToken(userId: number, hashedRefreshToken: string) {
    return await this.userRepository.update({
      id: userId
    }, {
      hashedRefreshToken
    });
  }

  public async updateEmailVerification(userId: number, verifiedStatus: boolean) {
    try {
      return await this.userRepository.update({
        id: userId
      }, {
        emailVerified: verifiedStatus
      });
    } catch(err) {
      console.log(err);

      throw new BadRequestException("Cannot activate user account");
    }
  }

  public async updatePassword(userId: number, newPassword: string) {
    try {
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      return await this.userRepository.update({
        id: userId
      }, {
        password: hashedNewPassword
      })
    } catch(err) {
      console.log(err);

      throw new BadRequestException("Cannot change user password");
    }
  }

  public async enable2fa(userId: number, tfaSecret: string) {
    try {
      return await this.userRepository.update({
        id: userId
      }, {
        tfa: true,
        tfaSecret: tfaSecret
      });
    } catch(err) {
      console.log(err);

      throw new BadRequestException("Cannot enable 2fa");
    }
  }

  public async disable2fa(userId: number) {
    try {
      return await this.userRepository.update({
        id: userId
      }, {
        tfa: false,
        tfaSecret: null
      });
    } catch(err) {
      console.log(err);

      throw new BadRequestException("Cannot disable 2fa");
    }
  }

  public async failedLoginAttempt(userId: number, lastFailedLoginDate: Date, failedLoginAttemps: number) {
    try {
      const newFailedLoginAttempsValue = failedLoginAttemps += 1;
      let isAccountBlocked: boolean = false;

      if (newFailedLoginAttempsValue >= parseInt(process.env.ACCOUNT_MAX_FAILED_ATTEMPS)) {
        isAccountBlocked = true;
      }

      if (isAccountBlocked) {
        return await this.userRepository.update({
          id: userId
        }, {
          failedLoginAttemps: newFailedLoginAttempsValue,
          isAccountLocked: isAccountBlocked
        });
      } else {
        return await this.userRepository.update({
          id: userId
        }, {
          failedLoginAttemps: newFailedLoginAttempsValue,
          lastFailedLogin: lastFailedLoginDate
        });
      }
    } catch(err) {
      console.log(err);

      throw new BadRequestException('Something went wrong');
    }
  }

  public async clearFailedAttemps(userId: number) {
    try {
      return await this.userRepository.update({
        id: userId
      }, {
        failedLoginAttemps: 0
      });
    } catch(err) {
      console.log(err);

      throw new BadRequestException('Cannot clear failed attempts');
    }
  }

  public async unlockUserAccount(userId: number) {
    try {
      return await this.userRepository.update({
        id: userId
      }, {
        failedLoginAttemps: 0,
        lastFailedLogin: null,
        isAccountLocked: false
      });
    } catch(err) {
      console.log(err);

      throw new BadRequestException('Something went wrong');
    }
  }
}
