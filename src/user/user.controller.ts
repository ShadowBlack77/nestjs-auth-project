import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { Public, Roles } from 'src/auth/decorators';
import { Role } from 'src/auth/enum';
import { JwtAuthGuard } from 'src/auth/guards';
import { MailsService } from 'src/mails/mails.service';

@Controller('user')
export class UserController {

  constructor(private readonly userService: UserService) {}

  @Public()
  @Post("/")
  @HttpCode(HttpStatus.CREATED)
  public create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get("/profile")
  public getProfile(@Req() req: any) {
    return this.userService.findOne(req.user.id);
  } 

  @Patch("/:id")
  public update(@Param("id", ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {

  }

  @Roles(Role.ADMIN)
  @Delete("/:id")
  public remove(@Param("id", ParseIntPipe) id: number) {
    
  }
}
