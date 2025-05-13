import Elysia, { t } from 'elysia';
import { authMacro } from '../../middlewares/auth';
import { _createMessage } from '../../libs/validation/chat';
import {
  createChat,
  createMessage,
  getChat,
  getMessages,
} from './chat-service';

export function chatController() {
  return new Elysia({ prefix: '/chats' })
    .use(authMacro)
    .get(
      '/',
      async ({ user, query: { cursor, offset } }) => {
        return await getChat(user, cursor, offset);
      },
      {
        auth: true,
        query: t.Object({
          cursor: t.Number({ default: 0 }),
          offset: t.Number({ default: 0 }),
        }),
      },
    )
    .post(
      '/',
      async ({ user, body: { userIds, chatId } }) => {
        return await createChat(user, userIds, chatId);
      },
      {
        auth: true,
        body: t.Object({
          userIds: t.Array(t.String({ error: 'You need to add some people' })),
          chatId: t.String({ format: 'uuid' }),
        }),
      },
    )
    .post(
      '/:chatId/message',
      async ({ body, params: { chatId }, user }) => {
        return createMessage(user, chatId, body);
      },
      { auth: true, body: t.Omit(_createMessage, ['chatId', 'userId']) },
    )
    .get(
      '/:chatId/messages',
      async (
        { user, params: { chatId }, query: { cursor, offset } },
      ) => {
        return await getMessages(user, chatId, cursor, offset);
      },
      {
        auth: true,
        query: t.Object({
          cursor: t.Number({ default: 0 }),
          offset: t.Number({ default: 0 }),
        }),
      },
    );
}
