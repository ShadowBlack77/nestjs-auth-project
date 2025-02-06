import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Req, UseGuards} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserRequest, UserRequest } from './models';
import { ContentResponse } from 'src/shared/models';
import { UpdateUserRequest } from './models/update-user.request';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Public, Roles } from '../auth/decorators';
import { Role } from '../auth/enum';

@Controller('user')
export class UserController {

  constructor(private readonly userService: UserService) {}

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post("/")
  @HttpCode(HttpStatus.CREATED)
  public create(@Body() createUserRequest: CreateUserRequest): Promise<ContentResponse> {
    return this.userService.create(createUserRequest);
  }

  @Get("/profile")
  public getProfile(@Req() req: UserRequest) {
    return this.userService.getProfile(req.user.id);
  } 

  @Patch("/")
  public update(@Req() req: UserRequest, @Body() updateUserRequest: UpdateUserRequest) {
    return this.userService.update(req.user.id, updateUserRequest);
  }

  @Roles(Role.ADMIN)
  @Delete("/:id")
  public remove(@Param("id", ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
