import { type ServerAuth } from '@shrymp/types';
import { createAuthClient } from 'better-auth/react';
import { inferAdditionalFields } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<ServerAuth>(),
  ],
  baseURL: 'http://localhost:3000',
});
