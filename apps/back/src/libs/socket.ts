import { AppSocketPayload, User } from '@shrymp/types';
import { ElysiaWS } from 'elysia/ws';

export class ServerSocket {
  constructor(private readonly ws: ElysiaWS) {}

  async send<T extends keyof AppSocketPayload>(
    key: T,
    data: AppSocketPayload[T],
  ) {
    if ('key' in data) {
      throw new Error(
        "Invalid key detected in the body, you can't pass 'key' inside of the data",
      );
    }

    this.ws.sendText(JSON.stringify({ key, data: { ...data } }), true);
  }
}

export const serverSocketMap = new Map<User['id'], ServerSocket>();
