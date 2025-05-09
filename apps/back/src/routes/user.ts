import Elysia, { t } from 'elysia';
import { authMiddleware } from '../middlewares/auth';
import { database } from '../middlewares/db';
import { apiError } from '../errors/utils';
import { _insertPrivateKeysSchema } from '../libs/validation/user';
import { and, eq, like, ne } from 'drizzle-orm';

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
      async ({ user, db, schema, body: { privateKey, publicKey } }) => {
        const [version] = await db.select({ version: schema.user.keyVersion })
          .from(schema.user)
          .where(
            eq(schema.user.id, user.id),
          ).limit(1);
        if (!version) {
          return apiError('Error while retrieving the key version', null);
        }
        console.log(version);

        await db.insert(schema.privateKey).values({
          ...privateKey,
          userId: user.id,
          version: version.version ? version.version + 1 : 1,
        });
        await db.update(schema.user).set({
          publicKey: publicKey,
          keyVersion: version.version ? version.version + 1 : 1,
        }).where(
          eq(schema.user.id, user.id),
        );
        return {
          data: { version: version.version ? version.version + 1 : 1 },
          error: null,
        };
      },
      {
        auth: true,
        body: t.Object({
          privateKey: t.Omit(_insertPrivateKeysSchema, ['userId', 'version']),
          publicKey: t.String(),
        }),
      },
    )
    .get('/search', async ({ query: { cursor, query }, db, schema, user }) => {
      if (!cursor) cursor = 0;
      if (!query) return null;

      const data = await db.select().from(schema.user).where(
        and(like(schema.user.name, `%${query}%`), ne(schema.user.id, user.id)),
      ).limit(
        11,
      ).offset(cursor * 10);

      return {
        data: {
          users: data.slice(0, 10),
          nextCursor: data.length > 10 ? cursor + 1 : null,
        },
        error: null,
      };
    }, {
      auth: true,
      query: t.Object({
        cursor: t.Optional(t.Number()),
        query: t.Optional(t.String()),
      }),
    });
}
