import Elysia from 'elysia';
import { auth } from '../libs/auth';

export const authMacro = new Elysia({ name: 'auth' }).macro({
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
