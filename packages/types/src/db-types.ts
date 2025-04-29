import { chat, message, user } from '../../../apps/back/src/libs/db/schema';

export type User = typeof user.$inferSelect;
export type Chat = typeof chat.$inferSelect;
export type Message = typeof message.$inferSelect;
export interface PopulatedChat extends Chat {
  users: User[];
  messages: Message[];
}
