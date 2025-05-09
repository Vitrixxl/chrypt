import type { AppSocketPayload } from '@shrymp/types';

export class ClientSocket {
  constructor(private readonly socket: WebSocket) {
    this.socket.onopen = () => console.log('OPENED');
    this.socket.onmessage = (event) => {
      console.log(this.handlers);
      const message = event.data;
      if (typeof message != 'string') {
        console.error('Invalid data recieved');
      }

      const parsedMessage = JSON.parse(message);
      console.log({ parsedMessage });
      if (
        !parsedMessage.key ||
        !this.handlers[parsedMessage.key as keyof AppSocketPayload]
      ) {
        return;
      }

      this.handlers[parsedMessage.key as keyof AppSocketPayload]?.(
        parsedMessage.data,
      );
    };
  }

  private handlers: {
    [K in keyof AppSocketPayload]?: (data: AppSocketPayload[K]) => void;
  } = {};

  on<K extends keyof AppSocketPayload>(
    key: K,
    handler: (data: AppSocketPayload[K]) => void,
  ) {
    this.handlers[key] = handler as typeof this.handlers[K];
  }
}
