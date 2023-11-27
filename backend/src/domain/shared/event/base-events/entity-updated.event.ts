import EntityBase from '@domain/shared/entity/entity-base';
import IDomainEvent from '../domain.event';

export default abstract class EntityUpdatedEvent<
  TEntity extends EntityBase<any>,
  TKey = TEntity extends EntityBase<infer U> ? U : never,
> implements IDomainEvent
{
  constructor(public readonly entity: TEntity) {}
}
