import type { chat, message } from '../backend/src/lib/db/schema';

export type MessageKey = {
  version: string;
  key: string;
};

export type Message = typeof message.$inferSelect;
export type Chat = typeof chat.$inferSelect;
