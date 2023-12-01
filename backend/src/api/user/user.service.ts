import User, { UserRole } from '@domain/user/model/user';
import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '@service/user/commands/create-user/create-user.command';
import { Result } from '@shared/typings/result';

@Injectable()
export class UserService {
  constructor(private readonly commandBus: CommandBus) { }

  async register(username: string, password: string) {
    const command = new CreateUserCommand(username, password, UserRole.User);

    return this.commandBus.execute<CreateUserCommand, Result<User>>(command);
  }
}
