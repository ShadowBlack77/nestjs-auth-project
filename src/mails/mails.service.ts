import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { MailerService as NestMailService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailTokens } from 'src/entities';
import { Repository } from 'typeorm';
import { EmailTokensTypes } from 'src/auth/enum';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class MailsService {

  constructor(
    private readonly mailService: NestMailService,
    private readonly userService: UserService,
    @InjectRepository(EmailTokens) private readonly emailTokensRepository: Repository<EmailTokens>
  ) {}

  public async sendMail(to: string, subject: string, context: { tokenId: string, token: string }, template: string) {
    try {
      await this.mailService.sendMail({
        to: to,
        from: 'dogry.bonus@op.pl',
        subject: subject,
        template: template,
        context: { tokenId: context.tokenId, token: context.token}
      });

      return { content: "email sended successfully" };
    } catch(err) {
      console.log(err);

      throw new BadRequestException("Email was not send!");
    }
  }

  public async generateEmailTokens(userId: number, emailType: EmailTokensTypes) {
    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new BadRequestException("Error during sending email");
    }

    const token = uuidv4();
    const tokenId = uuidv4();
    const expiresAt = new Date();

    const hashedToken = await bcrypt.hash(token, 10);

    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    const newTokenObject = {
      token: hashedToken,
      tokenId: tokenId,
      user: user,
      expiresAt: expiresAt,
      type: emailType
    }

    const savedToken = this.emailTokensRepository.create(newTokenObject);

    await this.emailTokensRepository.save(savedToken);

    return { token, tokenId };
  }

  public async checkTokenValidation(tokenId: string, token: string, newPassword?: string) {
    const emailToken = await this.emailTokensRepository.findOne({
      where: {
        tokenId: tokenId
      },
      relations: ['user'],
    });

    if (!emailToken) {
      throw new UnauthorizedException("Invlaid or expired token");
    }

    const hashedToken = emailToken.token;
    const emailType = emailToken.type;

    const isTokenMatched = await bcrypt.compare(token, hashedToken);

    if (!isTokenMatched) {
      throw new UnauthorizedException("Token invalid");
    }

    if (new Date() > emailToken.expiresAt) {
      throw new UnauthorizedException("Token has expired");
    }

    const user = await this.userService.findOne(emailToken.user.id);

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    await this.emailTokensRepository.delete({
      tokenId: tokenId
    });

    if (emailType === EmailTokensTypes.VERIFY_EMAIL) {
      await this.userService.updateEmailVerification(user.id, true);

      return { content: 'Email successfully verified!' }; 
    }

    if (emailType === EmailTokensTypes.RESET_PASSWORD && newPassword) {
      await this.userService.updatePassword(user.id, newPassword)

      return { content: 'Password successfully changed!' }; 
    }
  }
}
