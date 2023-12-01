import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import * as bcrypt from 'bcrypt';

import User from '@domain/user/model/user';
import { UserRepository } from '@persistance/user/user.repository';
import {
  err,
  GeneralError,
  ok,
  Result,
  ValidationError,
} from '@shared/typings/result';
import { CreateUserCommand } from './create-user.command';

@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler
  implements ICommandHandler<CreateUserCommand>
{
  private static readonly LOGGER = new Logger(CreateUserCommandHandler.name);
  constructor(private readonly repository: UserRepository) { }

  async execute(command: CreateUserCommand): Promise<Result<User>> {
    const existingUser = await this.repository.findOneByCriteria({
      username: command.username,
    });
    if (existingUser.isOk())
      return err(
        new ValidationError('Existing user with specified username exists'),
      );

    try {
      const saltRounds = 10;
      const hash = await bcrypt.hash(command.password, saltRounds);

      const user = User.create({
        id: uuid(),
        password: hash,
        username: command.username,
        role: command.role,
      });

      const userEntity = await this.repository.add(user);
      await this.repository.UnitOfWork.commit();

      return ok(userEntity);
    } catch (e) {
      CreateUserCommandHandler.LOGGER.error(e);
      return err(new GeneralError(e.message));
    }
  }
}
