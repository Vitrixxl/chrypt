import Elysia from 'elysia';
import { auth } from '../lib/auth';

export const authMiddleware = new Elysia({ name: 'auth' })
  .macro({
    auth: {
      async resolve({ error, request: { headers } }) {
        const session = await auth.api.getSession({
          headers,
        });

        if (!session) return error(401);

        return {
          user: session.user,
          session: session.session,
        };
      },
    },
  });
