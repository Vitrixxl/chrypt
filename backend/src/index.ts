import { Elysia } from 'elysia';
import { authRouter } from './routes/auth';
import swagger from '@elysiajs/swagger';

const app = new Elysia().get('/', () => 'Hello Elysia')
  .use(swagger())
  .use(authRouter)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
