import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';

const modules = [UserModule];

@Module({
  imports: [...modules],
  exports: [...modules],
})
export class ServiceModule {}
