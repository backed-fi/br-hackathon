import { Module } from '@nestjs/common';
import { PersistanceModule } from '@persistance/persistance.module';
import { FindUserQueryHandler } from './queries/find-user/find-user.query.handler';
import { CreateUserCommandHandler } from './commands/create-user/create-user.command.handler';

const queryHandlers = [FindUserQueryHandler];
const commandHandlers = [CreateUserCommandHandler];

@Module({
  imports: [PersistanceModule],
  providers: [...queryHandlers, ...commandHandlers],
})
export class UserModule { }
