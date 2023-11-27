import * as bcrypt from 'bcrypt';
import { Entity, Enum, PrimaryKey, Property, Unique } from '@mikro-orm/core';

import EntityBase from '@domain/shared/entity/entity-base';

export enum UserRole {
  Admin = 'ADMIN',
  User = 'USER',
}

export interface UserAttributes {
  id: string;
  username: string;
  password: string;
  role: UserRole;
}

@Entity({ tableName: 'user' })
export default class User extends EntityBase<string> {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'uuid_generate_v4()' })
  public declare id: string;

  @Property()
  @Unique()
  public readonly username: string;

  @Property()
  public readonly password: string;

  @Enum(() => UserRole)
  public readonly role: UserRole;

  @Property()
  public readonly createdAt: Date = new Date();

  private constructor(attributes: UserAttributes) {
    super();

    this.id = attributes.id;
    this.username = attributes.username;
    this.password = attributes.password;
  }

  public validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password || '');
  }

  public static create(attributes: UserAttributes): UserAttributes {
    return new User(attributes);
  }
}
