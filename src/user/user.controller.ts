import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto, UserRequest } from './models';
import { Public, Roles } from 'src/auth/decorators';
import { Role } from 'src/auth/enum';
import { ContentResponse } from 'src/shared/models';

@Controller('user')
export class UserController {

  constructor(private readonly userService: UserService) {}

  @Public()
  @Post("/")
  @HttpCode(HttpStatus.CREATED)
  public create(@Body() createUserDto: any): Promise<ContentResponse> {
    return this.userService.create(createUserDto);
  }

  @Get("/profile")
  public getProfile(@Req() req: UserRequest) {
    return this.userService.getProfile(req.user.id);
  } 

  @Patch("/:id")
  public update(@Param("id", ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {

  }

  @Roles(Role.ADMIN)
  @Delete("/:id")
  public remove(@Param("id", ParseIntPipe) id: number) {
    
  }
}
