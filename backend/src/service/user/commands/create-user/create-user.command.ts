import { UserRole } from '@domain/user/model/user';

export class CreateUserCommand {
  constructor(
    public readonly username,
    public readonly password,
    public readonly role: UserRole,
  ) { }
}
