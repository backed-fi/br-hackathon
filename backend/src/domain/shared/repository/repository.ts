import {
  AnyEntity,
  EntityManager,
  EntityRepository,
  FilterQuery,
  ObjectQuery,
  Populate,
  QueryOrderMap,
} from '@mikro-orm/core';
import { EventBus } from '@nestjs/cqrs';
import { err, NotFoundError, ok, Result } from '@shared/typings/result';
import EntityBase from '../entity/entity-base';
import BaseEntityEventFactory from '../event/base-events/entity-event.factory';
import { IUnitOfWork, UnitOfWork } from './unit-of-work';

export interface IRepository<
  TEntity extends EntityBase<TKey>,
  TKey = TEntity extends EntityBase<infer U> ? U : never,
> {
  UnitOfWork: IUnitOfWork;
  findById(id: TKey): Promise<TEntity>;
  findOneByCriteria(criteria: ObjectQuery<TEntity>): Promise<Result<TEntity>>;
  findByCriteria<P extends Populate<TEntity> = Populate<TEntity>>(
    query: FilterQuery<TEntity>,
    orderBy?: QueryOrderMap<TEntity>,
    populate?: P,
  ): Promise<TEntity[]>;
  findByCriteriaPaginated<P extends Populate<TEntity> = Populate<TEntity>>(
    query: FilterQuery<TEntity>,
    pagination: {
      limit: number;
      offset: number;
    },
    populate?: P,
  ): Promise<[TEntity[], number]>;
  add(item: TEntity): Promise<TEntity>;
  update(item: TEntity): Promise<TEntity>;
  // eslint-disable-next-line @typescript-eslint/ban-types
  delete(item: TEntity): Promise<{}>;
}

// eslint-disable-next-line @typescript-eslint/ban-types
declare type EntityClass<T extends AnyEntity<T>> = Function & {
  prototype: T;
};

export abstract class Repository<
  TEntity extends EntityBase<any>,
  TEntityClass extends EntityClass<TEntity> = EntityClass<TEntity>,
  TKey = TEntity extends EntityBase<infer U> ? U : never,
> implements IRepository<TEntity, TKey>
{
  protected repository: EntityRepository<TEntity>;
  constructor(
    private em: EntityManager,
    private entityType: TEntityClass,
    private eventBus?: EventBus,
    private eventFactory?: BaseEntityEventFactory<TEntity>,
  ) {
    this.repository = em.getRepository(entityType);
    this.UnitOfWork = new UnitOfWork(em, eventBus);
  }
  UnitOfWork: IUnitOfWork;

  findById(id: TKey) {
    // ???
    return this.repository.findOne(id as any);
  }

  async findOneByCriteria(criteria: ObjectQuery<TEntity>) {
    // ???
    const result = await this.repository.findOne(criteria);
    return result
      ? ok(result)
      : err<TEntity>(
          new NotFoundError(`Entity ${this.entityType.name} not found`),
        );
  }

  async findByCriteria<P extends Populate<TEntity> = Populate<TEntity>>(
    query: FilterQuery<TEntity>,
    orderBy: QueryOrderMap<TEntity> = undefined,
    populate: P = undefined,
  ) {
    return this.repository.find(query, { populate, orderBy });
  }
  async findByCriteriaPaginated<
    P extends Populate<TEntity> = Populate<TEntity>,
  >(
    query: FilterQuery<TEntity>,
    pagination: { limit: number; offset: number },
    populate?: P,
  ): Promise<[TEntity[], number]> {
    const result = this.repository.findAndCount(query, { populate });
    return result;
  }

  async add(item: TEntity): Promise<TEntity> {
    await this.repository.persist(item);
    if (this.eventFactory) {
      item.addDomainEvent(this.eventFactory.entityCreatedEvent(item));
    }
    return item;
  }
  async update(item: TEntity): Promise<TEntity> {
    if (this.eventFactory) {
      item.addDomainEvent(this.eventFactory.entityUpdatedEvent(item));
    }
    return this.repository.merge(item);
  }
  async delete(item: TEntity) {
    if (this.eventFactory) {
      item.addDomainEvent(this.eventFactory.entityDeletedEvent(item));
    }
    return this.repository.remove(item);
  }
}
