import { IRepository } from '@domain/shared/repository/repository';
import User from './model/user';

export default interface IUserRepository extends IRepository<User> {
  getByUsername(username: string): Promise<User>;
}
