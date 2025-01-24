import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { Roles } from 'src/auth/decorators';
import { Role } from 'src/auth/enum';

@Controller('user')
export class UserController {

  constructor(private readonly userService: UserService) {}

  @Post("/")
  @HttpCode(HttpStatus.CREATED)
  public create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get("/profile")
  public getProfile(@Res() res: any) {
    console.log(res);
  } 

  @Patch("/:id")
  public update(@Param("id", ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {

  }

  @Roles(Role.ADMIN)
  @Delete("/:id")
  public remove(@Param("id", ParseIntPipe) id: number) {
    
  }
}
