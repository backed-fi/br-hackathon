import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import * as bcrypt from 'bcrypt';
import { GeneralError, Result, err, ok } from '@shared/typings/result';
import { FindUserQuery } from '@service/user/queries/find-user/find-user.query';
import User from '@domain/user/model/user';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly queryBus: QueryBus,
  ) { }

  async login(user: User) {
    const payload = {
      userId: user.id,
      username: user.username,
    };

    const accessToken = await this.jwtService.sign(payload);

    return { accessToken, userId: user.id };
  }

  async validateUser(username: string, pass: string): Promise<Result<User>> {
    const query = new FindUserQuery(username);
    return await this.queryBus
      .execute<FindUserQuery, Result<User>>(query)
      .andThenAsync(async (user) => {
        if (!user) {
          return err(new GeneralError('User does not exist'));
        }

        if (!(await user.validatePassword(pass))) {
          return err(new GeneralError('Incorrect password'));
        }

        return ok(user);
      });
  }
}
