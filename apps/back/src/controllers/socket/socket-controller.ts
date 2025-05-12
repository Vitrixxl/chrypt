import Elysia from 'elysia';
import { authMacro } from '../../middlewares/auth';
import { ServerSocket, serverSocketMap } from '../../libs/socket';
import { User } from '@shrymp/types';

export const socketController = () =>
  new Elysia({ prefix: '/socket' })
    .use(authMacro)
    .ws('/connect', {
      open: (ws) => {
        const user = (ws.data as unknown as { user: User }).user;
        serverSocketMap.set(user.id, new ServerSocket(ws));
      },
      auth: true,
    });
