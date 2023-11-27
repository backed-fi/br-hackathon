import { HttpException, HttpStatus } from '@nestjs/common';
import { Result, ValidationError } from '@shared/typings/result';

// TODO: single method with optional mapper for single entry

export function unwrapToResponse<T>(result: Result<T>) {
  if (result.isOk()) return result.unwrap();

  errorHandler<T>(result);
}

export async function unwrapToResponseAsync<T>(
  resultAsync: Promise<Result<T>>,
) {
  return unwrapToResponse(await resultAsync);
}

export function mapToResponse<T, TMapped = T>(
  result: Result<T>,
  mapper: (result: T) => TMapped,
) {
  if (result.isOk()) {
    const unwraped = result.unwrap();

    return mapper(unwraped);
  }

  errorHandler<T>(result);
}

function errorHandler<T>(result: Result<T>) {
  const error = result.unwrapErr();
  if (error instanceof ValidationError)
    throw new HttpException(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Bad Request Error',
        details: error.message,
      },
      HttpStatus.BAD_REQUEST,
    );

  throw new HttpException(
    {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal Server Error',
      details: error.message,
    },
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}

export async function mapToResponseAsync<T, TMapped = T>(
  resultAsync: Promise<Result<T>>,
  mapper: (result: T) => TMapped,
) {
  return mapToResponse(await resultAsync, mapper);
}
