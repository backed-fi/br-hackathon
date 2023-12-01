import { Public } from '@api/shared/decorators/public.decorator';
import { Body, Controller, Post } from '@nestjs/common';
import { mapToResponseAsync } from '@api/shared/mapToResponse';
import { UserService } from './user.service';
import User from '@domain/user/model/user';

@Public()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post('register')
  async login(
    @Body('username') username: string,
    @Body('password') password: string,
  ): Promise<string> {
    return mapToResponseAsync(
      this.userService.register(username, password),
      (u) => u.id,
    );
  }
}
