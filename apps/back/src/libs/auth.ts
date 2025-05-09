import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';
import * as schema from './db/schema';

export const auth = betterAuth({
  trustedOrigins: ['http://localhost:5173'],
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      publicKey: {
        type: 'string',
        required: false,
        input: false,
        returned: true, // inclus dans l’API
        defaultValue: null,
      },
      keyVersion: {
        type: 'number',
        required: false,
        input: false,
        returned: true,
      },
    },
  },
});
