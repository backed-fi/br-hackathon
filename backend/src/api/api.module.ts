import { MikroORM } from '@mikro-orm/core';
import { OnApplicationBootstrap } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CoreModule } from './core/core.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [CoreModule, AuthModule, UserModule],
})
export class ApiModule implements OnApplicationBootstrap {
  constructor(private readonly mikroOrm: MikroORM) { }

  async onApplicationBootstrap() {
    await this.mikroOrm.getMigrator().up();
  }
}
