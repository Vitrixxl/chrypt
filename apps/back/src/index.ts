import { Elysia } from 'elysia';
import swagger from '@elysiajs/swagger';
import cors from '@elysiajs/cors';
import { errorsHandler } from './errors/handler';
import {
  authController,
  chatController,
  socketController,
  userController,
} from './controllers';
import { frontController } from './controllers/front/front-controller';

const app = new Elysia({ prefix: '/api' })
  .use(
    cors({
      origin: true,
    }),
  )
  .use(swagger())
  .use(errorsHandler())
  .use(authController())
  .use(chatController())
  .use(userController())
  .use(socketController());

if (Bun.env.NODE_ENV == 'production') {
  app.use(frontController());
}

app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port} test`,
);

export type App = typeof app;
