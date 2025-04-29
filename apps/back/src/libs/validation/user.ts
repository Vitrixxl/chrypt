import { createInsertSchema } from 'drizzle-typebox';
import { privateKey } from '../db/schema';

export const _insertPrivateKeysSchema = createInsertSchema(privateKey);
