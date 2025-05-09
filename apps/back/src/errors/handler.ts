import Elysia from 'elysia';

export const errorsHandler = () => {
  return new Elysia()
    .onError(({ error, code }) => {
      console.error(error);
      switch (code) {
        case 'VALIDATION': {
          return {
            data: null,
            error: {
              message: 'Invalid request',
              details: error,
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
              details: error,
            },
          };
        }
      }
    });
};
