import Elysia, { Context } from 'elysia';
import { auth } from '../../libs/auth';
import { apiError } from '../../errors/utils';

const betterAuthView = (context: Context) => {
  const BETTER_AUTH_ACCEPT_METHODS = ['POST', 'GET'];
  if (BETTER_AUTH_ACCEPT_METHODS.includes(context.request.method)) {
    return auth.handler(context.request);
  } else {
    return apiError('Unsupported method', null);
  }
};

export const authController = () => new Elysia().all('/auth/*', betterAuthView);
