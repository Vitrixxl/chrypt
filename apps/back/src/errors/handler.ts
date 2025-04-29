import Elysia from 'elysia';
import { message } from '../libs/db/schema';

export const errorsHandler = () => {
  return new Elysia()
    .onError(({ error, code, path }) => {
      switch (code) {
        case 'VALIDATION': {
          return {
            data: null,
            error: {
              message: 'Invalid request',
              details: {
                error,
                path,
              },
            },
          };
        }
        default: {
          return {
            data: null,
            error: {
              message: error instanceof Error
                ? error.message
                : 'Internal Server Error',
              details: {
                error,
                path,
              },
            },
          };
        }
      }
    });
};
