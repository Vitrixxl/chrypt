import { ActivatedUser, Message } from './db-types';
export type AppSocketPayload = {
  'new-chat': {
    users: ActivatedUser[];
    chatId: string;
  };
  'new-message': {
    chatId: string;
    message: Message;
  };
};
