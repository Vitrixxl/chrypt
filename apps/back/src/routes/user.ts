import Elysia, { t } from 'elysia';
import { authMiddleware } from '../middlewares/auth';
import { database } from '../middlewares/db';
import { apiError } from '../errors/utils';
import { _insertPrivateKeysSchema } from '../libs/validation/user';
import { eq } from 'drizzle-orm';

export function userRouter() {
  return new Elysia({ prefix: 'user' })
    .use(database)
    .use(authMiddleware)
    .get('/keys', async ({ user, db, schema }) => {
      const keys = await db.select().from(schema.privateKey).where(
        eq(schema.privateKey.userId, user.id),
      );
      return { data: keys, error: null };
    }, { auth: true })
    .post(
      '/keys',
      async ({ user, db, schema, path, body: { privateKey, publicKey } }) => {
        if (user.publicKey) {
          return apiError('You already set your keys', null, path);
        }
        await db.insert(schema.privateKey).values({
          ...privateKey,
          userId: user.id,
        });
        await db.update(schema.user).set({ publicKey: publicKey });
        return { data: { message: 'Correctly updated' }, error: null };
      },
      {
        auth: true,
        body: t.Object({
          privateKey: t.Omit(_insertPrivateKeysSchema, ['userId']),
          publicKey: t.String(),
        }),
      },
    );
}
