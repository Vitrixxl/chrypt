import Elysia, { t } from 'elysia';
import { authMacro } from '../../middlewares/auth';
import { getKeys, searchUser, setKeys } from './user-service';
import { _insertPrivateKeysSchema } from '../../libs/validation/user';

export function userController() {
  return new Elysia({ prefix: 'user' })
    .use(authMacro)
    .get('/keys', async ({ user }) => {
      return await getKeys(user);
    }, { auth: true })
    .post(
      '/keys',
      async ({ user, body }) => {
        return await setKeys(user, body);
      },
      {
        auth: true,
        body: t.Object({
          privateKey: t.Omit(_insertPrivateKeysSchema, ['userId', 'version']),
          publicKey: t.String(),
        }),
      },
    )
    .get('/search', async ({ query: { cursor, query }, user }) => {
      return await searchUser(user, query, cursor);
    }, {
      auth: true,
      query: t.Object({
        cursor: t.Number({ default: 0 }),
        query: t.String(),
      }),
    });
}
