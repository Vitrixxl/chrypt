import { Elysia } from 'elysia';
import cors from '@elysiajs/cors';
import { errorsHandler } from './errors/handler';
import {
  authController,
  chatController,
  socketController,
  userController,
} from './controllers';

const app = new Elysia({ prefix: '/api' })
  .use(cors({ origin: true }))
  .use(errorsHandler())
  .use(authController())
  .use(chatController())
  .use(userController())
  .use(socketController()).listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port} test`,
);

export type App = typeof app;
