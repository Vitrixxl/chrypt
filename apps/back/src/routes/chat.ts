import Elysia, { t } from "elysia";
import { authMiddleware } from "../middlewares/auth";
import { database } from "../middlewares/db";
import { and, eq, getTableColumns } from "drizzle-orm";
import { jsonAgg } from "../libs/db/utils";
import { _createMessage } from "../libs/validation/chat";

export function chatRouter() {
	return new Elysia({ prefix: "/chats" })
		.use(authMiddleware)
		.use(database)
		.get(
			"/",
			async ({ db, schema }) => {
				const result = await db
					.select({
						...getTableColumns(schema.chat),
						messages: jsonAgg(getTableColumns(schema.message)),
						users: jsonAgg(getTableColumns(schema.user)),
					})
					.from(schema.chat)
					.innerJoin(
						schema.userChat,
						eq(schema.chat.id, schema.userChat.chatId),
					)
					.innerJoin(schema.user, eq(schema.userChat.userId, schema.user.id))
					.innerJoin(schema.message, eq(schema.chat.id, schema.message.chatId));

				return result;
			},
			{
				auth: true,
			},
		)
		.post(
			"/",
			async ({ db, schema, user, body: { userIds } }) => {
				if (!userIds.includes(user.id)) {
					return;
				}
				const [{ id: chatId }] = await db
					.insert(schema.chat)
					.values({})
					.returning();
				if (!chatId) return;
				await db
					.insert(schema.userChat)
					.values(userIds.map((id) => ({ userId: id, chatId: chatId })));
				return;
			},
			{
				auth: true,
				body: t.Object({
					userIds: t.Array(t.String()),
				}),
			},
		)
		.post(
			"/:id/message",
			async ({ db, schema, body, params: { id } }) => {
				await db.insert(schema.message).values({ ...body, chatId: id });
			},
			{ auth: true, body: t.Omit(_createMessage, ["chatId"]) },
		)
		.get(
			"/:id/message",
			async ({ db, schema, query, params: { id } }) => {
				const l = query["limit"] == "" ? Number(query["limit"]) : 30;
				const o = query["offset"] == "" ? Number(query["offset"]) : 0;
				const messages = await db
					.select()
					.from(schema.message)
					.where(eq(schema.message.chatId, id))
					.limit(l + 1)
					.offset(o);
				return {
					messages:
						messages.length > l
							? messages.slice(0, messages.length - 1)
							: messages,
					nextUrl: messages.length > l,
				};
			},
			{ auth: true },
		)
		.get(
			"/:id",
			async ({ db, schema, params: { id } }) => {
				const [chat] = await db
					.select({
						...getTableColumns(schema.chat),
						users: jsonAgg(getTableColumns(schema.user)),
					})
					.from(schema.chat)
					.innerJoin(
						schema.userChat,
						eq(schema.chat.id, schema.userChat.chatId),
					)
					.innerJoin(schema.user, eq(schema.userChat.userId, schema.user.id))
					.where(and(eq(schema.chat.id, id)));
				return chat;
			},
			{ auth: true },
		)
		.get(
			"/caca/:cacaId",
			({ params, db, schema, user }) => {
				params.cacaId;
			},
			{
				auth: true,
			},
		);
}
