import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto';

@Injectable()
export class UserService {

  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

  public async create(createUserDto: CreateUserDto) {
    try {
      const user = this.userRepository.create(createUserDto);
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const userToSave = { ...user, password: hashedPassword };
  
      await this.userRepository.save(userToSave);
  
      return { content: 'Created' };
    } catch(err) {
      throw new BadRequestException("User with this email or username already exists");
    }
  }

  public async findOne(id: number) {
    return await this.userRepository.findOne({
      where: {
        id
      },
      select: ['id', 'username', 'email', 'avatarUrl', 'role', 'hashedAccessToken', 'hashedRefreshToken']
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
      }
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
}
