import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { EntityManager } from '@mikro-orm/postgresql';

import User from '@domain/user/model/user';
import { Repository } from '@domain/shared/repository/repository';
import IUserRepository from '@domain/user/user.repository';

@Injectable()
export class UserRepository
  extends Repository<User>
  implements IUserRepository {
  constructor(entityManager: EntityManager, eventBus: EventBus) {
    super(entityManager, User, eventBus);
  }
  getByUsername(username: string): Promise<User> {
    return this.repository.findOne({ username });
  }
}
