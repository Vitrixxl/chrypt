import { and, eq, like, ne } from 'drizzle-orm';
import { db } from '../../libs/db';
import * as schema from '../../libs/db/schema';
import { User } from '@shrymp/types';
import { _insertPrivateKeysSchema } from '../../libs/validation/user';
import { Static } from 'elysia';
import { apiError } from '../../errors/utils';

export const getKeys = async (user: User) => {
  const keys = await db.select().from(schema.privateKey).where(
    eq(schema.privateKey.userId, user.id),
  );
  return { data: keys, error: null };
};

export const setKeys = async (
  user: User,
  keys: {
    privateKey: Omit<
      Static<typeof _insertPrivateKeysSchema>,
      'userId' | 'version'
    >;
    publicKey: string;
  },
) => {
  const [version] = await db.select({ version: schema.user.keyVersion })
    .from(schema.user)
    .where(
      eq(schema.user.id, user.id),
    ).limit(1);
  if (!version) {
    return apiError('Error while retrieving the key version', null);
  }

  await db.insert(schema.privateKey).values({
    ...keys.privateKey,
    userId: user.id,
    version: version.version ? version.version + 1 : 1,
  });
  await db.update(schema.user).set({
    publicKey: keys.publicKey,
    keyVersion: version.version ? version.version + 1 : 1,
  }).where(
    eq(schema.user.id, user.id),
  );
  return {
    data: { version: version.version ? version.version + 1 : 1 },
    error: null,
  };
};

export const searchUser = async (user: User, query: string, cursor: number) => {
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
};
