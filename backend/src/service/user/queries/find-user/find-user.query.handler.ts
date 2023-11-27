import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import User from '@domain/user/model/user';
import { UserRepository } from '@persistance/user/user.repository';
import { ok, Result } from '@shared/typings/result';
import { FindUserQuery } from './find-user.query';

@QueryHandler(FindUserQuery)
export class FindUserQueryHandler implements IQueryHandler<FindUserQuery> {
  private static readonly;
  constructor(private readonly repository: UserRepository) {}

  async execute(query: FindUserQuery): Promise<Result<User>> {
    try {
      const user = await this.repository.getByUsername(query.username);

      return ok(user);
    } catch (e) {}
  }
}
