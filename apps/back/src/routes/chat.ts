import Elysia, { t } from 'elysia';
import { v4 as uuid } from 'uuid';
import { authMiddleware } from '../middlewares/auth';
import { database } from '../middlewares/db';
import { and, desc, eq, getTableColumns, inArray } from 'drizzle-orm';
import { jsonAgg } from '../libs/db/utils';
import { _createMessage } from '../libs/validation/chat';
import { apiError } from '../errors/utils';
import type { ActivatedUser, User } from '@shrymp/types';
import { ServerSocket, serverSocketMap } from '../libs/socket';

const chatSocketMap: Map<string, ServerSocket> = new Map();

export function chatRouter() {
  return new Elysia({ prefix: '/chats' })
    .use(authMiddleware)
    .use(database)
    .get(
      '/',
      async ({ db, schema, user }) => {
        const chats = await db.select().from(schema.chat)
          .innerJoin(
            schema.userChat,
            eq(schema.chat.id, schema.userChat.chatId),
          ).innerJoin(schema.user, eq(schema.userChat.userId, schema.user.id))
          .where(eq(schema.user.id, user.id));

        const data = await db
          .select({
            ...getTableColumns(schema.chat),
            users: jsonAgg(getTableColumns(schema.user)),
          })
          .from(schema.chat)
          .innerJoin(
            schema.userChat,
            eq(schema.chat.id, schema.userChat.chatId),
          ).innerJoin(schema.user, eq(schema.userChat.userId, schema.user.id))
          .where(inArray(schema.chat.id, chats.map((c) => c.chat.id))).groupBy(
            schema.chat.id,
          ).orderBy(desc(schema.chat.createdAt));

        return { data, error: null };
      },
      {
        auth: true,
      },
    )
    /**
     * This end point create chat with the users specified by the user including himself
     */
    .post(
      '/',
      async ({ db, schema, user, body: { userIds, chatId } }) => {
        if (userIds.length === 1 && userIds.includes(user.id)) {
          return apiError("You can't start a chat with yourself", null);
        }
        await db
          .insert(schema.chat)
          .values({ id: chatId });

        await db
          .insert(schema.userChat)
          .values([
            ...userIds.filter((u) => u !== user.id).map((id) => ({
              userId: id,
              chatId: chatId,
            })),
            { userId: user.id, chatId: chatId },
          ]);

        const users: User[] = await db.select().from(schema.user).where(
          inArray(schema.user.id, userIds),
        );
        users.push(user);

        const notifyUsers = async (users: User[], chatId: string) => {
          for (const u of users) {
            const userSocket = serverSocketMap.get(u.id);
            console.log(userSocket);
            if (!userSocket) continue;
            userSocket.send('new-chat', {
              users: users.filter((u) =>
                u.publicKey && u.keyVersion
              ) as ActivatedUser[],
              chatId,
            });
          }
        };

        notifyUsers(users, chatId);

        return { data: null, error: null };
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
      '/:id/message',
      async ({ db, schema, body, params: { id }, user }) => {
        const [currentChat] = await db.select({
          ...getTableColumns(schema.chat),
          users: jsonAgg(getTableColumns(schema.user)),
        }).from(schema.chat).innerJoin(
          schema.userChat,
          eq(schema.chat.id, schema.userChat.chatId),
        ).innerJoin(schema.user, eq(schema.userChat.userId, schema.user.id))
          .groupBy(schema.chat.id)
          .where(
            eq(schema.chat.id, id),
          );
        if (!currentChat || !currentChat.users.find((u) => u.id == user.id)) {
          return apiError('You do not have access to this chat', null);
        }

        const { users } = currentChat;
        const messageId = uuid();
        const message = {
          ...body,
          id: messageId,
          chatId: id,
          userId: user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await db.insert(schema.message).values(message);

        // Notify the conntected users
        for (const u of users) {
          const userSocket = serverSocketMap.get(u.id);
          if (!userSocket || u.id == user.id) continue;
          userSocket.send('new-message', {
            message,
            chatId: id,
          });
        }
      },
      { auth: true, body: t.Omit(_createMessage, ['chatId', 'userId']) },
    )
    .get(
      '/:id/messages',
      async ({ db, schema, params: { id }, query: { cursor } }) => {
        const data = await db
          .select(getTableColumns(schema.message))
          .from(schema.message)
          .where(and(eq(schema.message.chatId, id))).orderBy(
            desc(schema.message.createdAt),
          )
          .limit(31)
          .offset(
            cursor * 30,
          );
        return {
          data: {
            messages: data.length > 30 ? data.slice(0, data.length) : data,
            nextCursor: data.length > 30 ? cursor + 1 : null,
          },
          error: null,
        };
      },
      {
        auth: true,
        query: t.Object({
          cursor: t.Number({ default: 0 }),
        }),
      },
    );
}
