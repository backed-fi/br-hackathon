import { Module } from '@nestjs/common';
import { PersistanceModule } from '@persistance/persistance.module';
import { FindUserQueryHandler } from './queries/find-user/find-user.query.handler';

const queryHandlers = [FindUserQueryHandler];

@Module({
  imports: [PersistanceModule],
  providers: [...queryHandlers],
})
export class UserModule {}
