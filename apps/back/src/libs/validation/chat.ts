import { createInsertSchema, createSelectSchema } from 'drizzle-typebox';
import { chat, message } from '../db/schema';
import { t } from 'elysia';

export const _createChat = createSelectSchema(chat);
export const _createMessage = createInsertSchema(message, {
  keys: t.Record(
    t.String(),
    t.Object({
      encryptedAESKey: t.String(),
      privateKeyVersion: t.Number(),
    }),
  ),
});
