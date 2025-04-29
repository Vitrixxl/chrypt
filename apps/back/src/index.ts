import { Elysia } from 'elysia';
import { authRouter } from './routes/auth';
import swagger from '@elysiajs/swagger';
import { chatRouter } from './routes/chat';
import cors from '@elysiajs/cors';
import { profileRouter } from './routes/profile';
import { errorsHandler } from './errors/handler';
import { userRouter } from './routes/user';

const app = new Elysia()
  .use(errorsHandler())
  .use(authRouter)
  .use(cors({ origin: ['http://localhost:5173'] }))
  .use(swagger())
  .use(chatRouter())
  .use(profileRouter())
  .use(userRouter())
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

export type App = typeof app;
