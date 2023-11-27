import { Entity, PrimaryKey } from '@mikro-orm/core';
import IDomainEvent from '../event/domain.event';
import { IBusinessRule } from '../rule/business-rule';

@Entity({
  abstract: true,
})
export default abstract class EntityBase<TKey> {
  private _domainEvents;
  private _domainEventsAsync;

  @PrimaryKey()
  public id: TKey;

  get domainEvents() {
    if (this._domainEvents?.length >= 0) {
      return this._domainEvents;
    }
    this._domainEvents = [];
    return this._domainEvents;
  }
  get domainEventsAsync() {
    if (this.domainEventsAsync?.length >= 0) {
      return this._domainEventsAsync;
    }
    this._domainEventsAsync = [];
    return this._domainEventsAsync;
  }

  addDomainEvent(event: IDomainEvent) {
    this.domainEvents.push(event);
  }
  addAsyncDomainEvent(event: IDomainEvent) {
    this.domainEventsAsync.push(event);
  }

  Validate(buisnessRule: IBusinessRule) {
    if (!buisnessRule.isValid()) {
      throw new Error(buisnessRule.errorMessage);
    }
  }
}
