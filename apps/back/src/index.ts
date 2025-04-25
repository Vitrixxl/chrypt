import { Elysia } from "elysia";
import { authRouter } from "./routes/auth";
import swagger from "@elysiajs/swagger";
import { chatRouter } from "./routes/chat";
import { logger } from "@bogeychan/elysia-logger";
import cors from "@elysiajs/cors";

const app = new Elysia()
	.use(authRouter)
	.use(cors({ origin: ["http://localhost:5173"] }))
	.use(logger())
	.use(swagger())
	.use(chatRouter())
	.listen(3000);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

export type App = typeof app;
