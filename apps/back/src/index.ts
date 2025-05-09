import { Elysia } from 'elysia';
import { authRouter } from './routes/auth';
import swagger from '@elysiajs/swagger';
import { chatRouter } from './routes/chat';
import cors from '@elysiajs/cors';
import { errorsHandler } from './errors/handler';
import { userRouter } from './routes/user';
import { ServerSocket, serverSocketMap } from './libs/socket';
import { User } from '@shrymp/types';
import { authMiddleware } from './middlewares/auth';

const app = new Elysia()
  .use(errorsHandler())
  .use(authRouter)
  .use(authMiddleware)
  .use(cors({ origin: ['http://localhost:5173'] }))
  .use(swagger())
  .use(chatRouter())
  .use(userRouter())
  .ws('/connect-socket', {
    open: (ws) => {
      const user = (ws.data as unknown as { user: User }).user;
      serverSocketMap.set(user.id, new ServerSocket(ws));
    },
    auth: true,
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

export type App = typeof app;
