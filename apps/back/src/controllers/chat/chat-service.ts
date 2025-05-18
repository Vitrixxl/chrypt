import { ActivatedUser, Chat, User } from '@shrymp/types';
import { v4 as uuid } from 'uuid';
import * as schema from '../../libs/db/schema';
import { and, desc, eq, getTableColumns, inArray } from 'drizzle-orm';
import { jsonAgg } from '../../libs/db/utils';
import { db } from '../../libs/db';
import { apiError } from '../../errors/utils';
import { serverSocketMap } from '../../libs/socket';
import { Static } from 'elysia';
import { _createMessage } from '../../libs/validation/chat';

export const getChat = async (user: User, cursor: number, offset: number) => {
  const LIMIT = 30;
  const chats = await db.select().from(schema.chat).innerJoin(
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
    ).orderBy(desc(schema.chat.createdAt)).limit(LIMIT + 1).offset(
      offset + LIMIT * cursor,
    );

  return {
    data: {
      chats: data.slice(0, LIMIT - 1),
      nextUrl: data.length > LIMIT ? cursor + 1 : null,
    },
    error: null,
  };
};

export const createChat = async (
  user: User,
  userIds: User['id'][],
  chatId: Chat['id'],
) => {
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
      if (!userSocket || u.id == user.id) continue;
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
};

export const createMessage = async (
  user: User,
  chatId: Chat['id'],
  messageData: Omit<Static<typeof _createMessage>, 'chatId' | 'userId'>,
) => {
  const [currentChat] = await db.select({
    ...getTableColumns(schema.chat),
    users: jsonAgg(getTableColumns(schema.user)),
  }).from(schema.chat).innerJoin(
    schema.userChat,
    eq(schema.chat.id, schema.userChat.chatId),
  ).innerJoin(schema.user, eq(schema.userChat.userId, schema.user.id))
    .groupBy(schema.chat.id)
    .where(
      eq(schema.chat.id, chatId),
    );
  if (!currentChat || !currentChat.users.find((u) => u.id == user.id)) {
    return apiError('You do not have access to this chat', null);
  }

  const { users } = currentChat;
  const messageId = uuid();
  const message = {
    ...messageData,
    id: messageId,
    chatId,
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
      chatId,
    });
  }
};

export const getMessages = async (
  user: User,
  chatId: Chat['id'],
  cursor: number,
  offset: number,
) => {
  const [currentChat] = await db.select()
    .from(schema.chat)
    .innerJoin(
      schema.userChat,
      eq(schema.chat.id, schema.userChat.chatId),
    ).where(eq(schema.userChat.userId, user.id));
  if (!currentChat) return apiError('Unauthorized', null);
  const data = await db
    .select(getTableColumns(schema.message))
    .from(schema.message)
    .where(and(eq(schema.message.chatId, chatId))).orderBy(
      desc(schema.message.createdAt),
    )
    .limit(31)
    .offset(
      cursor * 30 + offset,
    );
  return {
    data: {
      messages: data.length > 30 ? data.slice(0, data.length - 1) : data,
      nextCursor: data.length > 30 ? cursor + 1 : null,
    },
    error: null,
  };
};
