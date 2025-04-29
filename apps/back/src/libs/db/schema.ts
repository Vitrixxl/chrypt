import { AESKey } from '@shrymp/types';
import {
  boolean,
  integer,
  jsonb,
  pgTableCreator,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const table = pgTableCreator((name) => `shrymp_${name}`);
const timestamps = {
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
};

export const user = table('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull(),
  image: text('image'),
  publicKey: text('public_key'),
  ...timestamps,
});

export const session = table('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, {
      onDelete: 'cascade',
    }),
});

export const account = table('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, {
      onDelete: 'cascade',
    }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const verification = table('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
});

export const privateKey = table('private_key', {
  id: uuid().primaryKey().defaultRandom(),
  userId: text('user_id').references(() => user.id),
  key: text().notNull(),
  iv: text().notNull(),
  salt: text().notNull(),
  version: integer().notNull(),
  ...timestamps,
});

export const chat = table('chat', {
  id: uuid().primaryKey().defaultRandom(),
  ...timestamps,
});

export const userChat = table('user_chat', {
  userId: text('user_id')
    .references(() => user.id)
    .notNull(),
  chatId: uuid('chat_id')
    .references(() => chat.id)
    .notNull(),
  ...timestamps,
});

export const message = table('message', {
  id: uuid().primaryKey().defaultRandom(),
  chatId: uuid('chat_id')
    .references(() => chat.id)
    .notNull(),
  encryptedContent: text('encrypted_content').notNull(),
  iv: text('iv').notNull(),
  keys: jsonb('keys').$type<Record<string, AESKey>>().default({}).notNull(),
  ...timestamps,
});
