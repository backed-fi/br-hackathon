import * as Monads from '@hqoss/monads';

export class Error {
  readonly tag: string = Error.name;
  message = '';
}

export class ValidationError {
  readonly tag: string = ValidationError.name;
  constructor(readonly message: string) {}
}

export class GeneralError {
  readonly tag: string = GeneralError.name;
  constructor(readonly message: string) {}
}

export class NotFoundError extends Error {
  readonly tag = NotFoundError.name;
  constructor(readonly message: string) {
    super();
  }
}

export class Unit {}

export type Result<T> = Monads.Result<T, Error>;

export interface Match<T, U> {
  ok: (val: T) => U;
  err: (val: Error) => U;
}

export type Handler<TInput, TResponse> = (
  req: TInput,
) => Promise<Result<TResponse>>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export interface Array<T> {
    flattenAsync<T>(
      this: Array<Promise<Result<T>>>,
    ): Promise<Result<ReadonlyArray<T>>>;
    flattenSkipErrorsAsync<T>(
      this: Array<Promise<Result<T>>>,
    ): Promise<Result<ReadonlyArray<T>>>;
    flatten<T>(this: Array<Result<T>>): Result<ReadonlyArray<T>>;
    flattenSkipErrors<T>(this: Array<Result<T>>): Result<ReadonlyArray<T>>;
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export interface Promise<T> {
    andThenAsync<T, U>(
      this: Promise<Result<T>>,
      fn: (val: T) => Promise<Result<U>>,
    ): Promise<Result<U>>;
    matchAsync<T, U>(this: Promise<Result<T>>, fn: Match<T, U>): Promise<U>;
    mapErrAsync<T>(
      this: Promise<Result<T>>,
      fnErr: (val: Error) => Promise<Result<T>>,
    ): Promise<Result<T>>;
    unwrapOrElseAsync<T>(
      this: Promise<Result<T>>,
      fnErr: (val: Error) => Promise<T>,
    ): Promise<T>;
    flattenAsync<T>(this: Promise<Result<T>[]>): Promise<Result<T[]>>;
  }
}

export function okAsync<T>(val: T): Promise<Result<T>> {
  return new Promise<Result<T>>((resolve) => resolve(Monads.Ok(val)));
}

export function ok<T>(val: T): Result<T> {
  return Monads.Ok(val);
}

export function err<T>(err: Error): Result<T> {
  return Monads.Err(err);
}

export function errAsync<T>(err: Error): Promise<Result<T>> {
  return new Promise<Result<T>>((resolve) => resolve(Monads.Err(err)));
}

Promise.prototype.andThenAsync = async function (fnRes) {
  const curr = await this;
  return curr.isOk() ? fnRes(curr.unwrap()) : Monads.Err(curr.unwrapErr());
};

Promise.prototype.mapErrAsync = async function (fnErr) {
  const curr = await this;
  return curr.isOk() ? okAsync(curr.unwrap()) : fnErr(curr.unwrapErr());
};

Promise.prototype.unwrapOrElseAsync = async function (fnErr) {
  const curr = await this;
  return curr.isOk() ? curr.unwrap() : fnErr(curr.unwrapErr());
};

Promise.prototype.matchAsync = async function (match) {
  const result = await this;
  return new Promise((resolve) => resolve(result.match(match)));
};
Array.prototype.flattenSkipErrorsAsync = async function () {
  const curr = await Promise.all(this);
  return curr.flattenSkipErrors();
};

Array.prototype.flattenSkipErrors = function () {
  return ok(this.filter((res) => res.isOk()).map((res) => res.unwrap()));
};

Array.prototype.flattenAsync = async function () {
  const curr = await Promise.all(this);
  return curr.flatten();
};

Array.prototype.flatten = function () {
  const errors = this.filter((res) => res.isErr()).map((err) =>
    err.unwrapErr(),
  );
  if (errors.length > 0) {
    return err(errors[0]);
  }

  return ok(this.map((res) => res.unwrap()));
};
