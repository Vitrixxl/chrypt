import { createSelectSchema } from "drizzle-typebox";
import { chat, message } from "../db/schema";

export const _createChat = createSelectSchema(chat);
export const _createMessage = createSelectSchema(message);
