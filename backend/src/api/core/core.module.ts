import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { ServiceModule } from '@service/service.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MikroOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService) => {
        return {
          entities: ['./dist/domain/**/model/*.js'],
          dbName: configService.get('DATABASE_NAME'),
          type: 'postgresql',
          user: configService.get('DATABASE_USER'),
          password: configService.get('DATABASE_PASSWORD'),
          port: configService.get('DATABASE_PORT'),
          host: configService.get('DATABASE_HOST'),
          migrations: {
            path: __dirname + '../../../../dist/persistance/migrations',
            pattern: /^[\w-]+\d+\.js$/,
          },
        };
      },
    }),
    ServiceModule,
    {
      module: CqrsModule,
      global: true,
    },
  ],
  exports: [MikroOrmModule, ServiceModule],
})
export class CoreModule {}
