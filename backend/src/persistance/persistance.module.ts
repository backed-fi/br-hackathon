import { Module } from '@nestjs/common';
import { UserRepository } from './user/user.repository';

const repositories = [UserRepository];

@Module({
  providers: [...repositories],
  exports: [...repositories],
})
export class PersistanceModule {}
