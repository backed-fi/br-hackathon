import {
  EntityManager,
  UnitOfWork as MikroOrmUnitOfWork,
} from '@mikro-orm/core';
import { EventBus } from '@nestjs/cqrs';
import EntityBase from '../entity/entity-base';
import IDomainEvent from '../event/domain.event';

export interface IUnitOfWork {
  commit(): Promise<void>;
}

export class UnitOfWork implements IUnitOfWork {
  constructor(
    private em: EntityManager,
    private eventBus?: EventBus<IDomainEvent>,
  ) {}

  async commit() {
    const emUnitOfWork = this.em.getUnitOfWork();
    const managedEntities = this.getEntitiesToChange(emUnitOfWork);
    await this.em.flush();
    const eventsToPublish: IDomainEvent[] = [];
    for (const entity of managedEntities) {
      if (entity.domainEvents) {
        entity.domainEvents.map((event) => eventsToPublish.push(event));
        entity.domainEvents.length = 0;
      }
    }
    if (!this.eventBus && eventsToPublish.length > 0) {
      // log
      return;
    }

    if (this.eventBus) {
      this.eventBus.publishAll(eventsToPublish);
    }
  }

  private getEntitiesToChange(
    emUnitOfWork: MikroOrmUnitOfWork,
  ): EntityBase<any>[] {
    const managedEntities: EntityBase<any>[] = [];
    for (const entity of emUnitOfWork.getIdentityMap()) {
      managedEntities.push(entity as EntityBase<any>);
    }
    for (const entity of emUnitOfWork.getPersistStack()) {
      managedEntities.push(entity as EntityBase<any>);
    }
    for (const entity of emUnitOfWork.getRemoveStack()) {
      managedEntities.push(entity as EntityBase<any>);
    }
    return managedEntities;
  }
}
