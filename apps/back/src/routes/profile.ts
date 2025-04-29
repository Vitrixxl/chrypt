import Elysia, { t } from 'elysia';
import { database } from '../middlewares/db';
import { authMiddleware } from '../middlewares/auth';
import { eq, like } from 'drizzle-orm';

export function profileRouter() {
  return new Elysia({ prefix: '/profiles' })
    .use(database)
    .use(authMiddleware)
    .get('/', async ({ query: { limit, offset, query }, db, schema }) => {
      if (!limit) limit = 10;
      if (!offset && offset != 0) offset = 0;
      if (!query) return null;

      const data = await db.select().from(schema.user).where(
        like(schema.user.name, `%${query}%`),
      ).limit(
        limit,
      ).offset(offset);

      return { data, error: null };
    }, {
      auth: true,
      query: t.Object({
        limit: t.Optional(t.Number()),
        offset: t.Optional(t.Number()),
        query: t.Optional(t.String()),
      }),
    });
}
