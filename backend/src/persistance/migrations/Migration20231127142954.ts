import { Migration } from '@mikro-orm/migrations';

export class Migration20231127142954 extends Migration {

  async up(): Promise<void> {
    this.addSql('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    this.addSql('create table "user" ("id" uuid not null default uuid_generate_v4(), "username" varchar(255) not null, "password" varchar(255) not null, "role" text check ("role" in (\'ADMIN\', \'USER\')) not null, "created_at" timestamptz(0) not null, constraint "user_pkey" primary key ("id"));');
    this.addSql('alter table "user" add constraint "user_username_unique" unique ("username");');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "user" cascade;');
  }

}
