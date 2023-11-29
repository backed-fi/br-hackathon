import { Public } from '@api/shared/decorators/public.decorator';
import { Body, Controller, Post } from '@nestjs/common';
import { unwrapToResponseAsync } from '@api/shared/mapToResponse';
import { AuthService } from './auth.service';
import { ok } from '@shared/typings/result';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async login(
    @Body('username') username: string,
    @Body('password') password: string,
  ): Promise<{ accessToken: string }> {
    return unwrapToResponseAsync(
      this.authService
        .validateUser(username, password)
        .andThenAsync(async (user) => {
          const login = await this.authService.login(user);

          return ok(login);
        }),
    );
  }
}
