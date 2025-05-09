import { chat, message } from '../../../apps/back/src/libs/db/schema';
import { User } from './auth';

export type Chat = typeof chat.$inferSelect;
export type Message = typeof message.$inferSelect;
export type DecryptedMessage = {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface ActivatedUser extends User {
  publicKey: string;
  keyVersion: number;
}
export interface PopulatedChat extends Chat {
  users: ActivatedUser[];
}
