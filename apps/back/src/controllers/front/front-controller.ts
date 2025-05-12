import Elysia from 'elysia';
import { staticPlugin } from '@elysiajs/static';

/**
 * This controller will only be used in production, it will serve the build frontend bundle by vite
 */
export const frontController = () => {
  return new Elysia().use(
    staticPlugin({ prefix: '/', assets: '/front-dist' }),
  );
};
