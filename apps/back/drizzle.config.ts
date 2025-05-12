import { defineConfig } from 'drizzle-kit';
export default defineConfig({
  dialect: 'postgresql',
  dbCredentials: {
    url: 'postgresql://postgres:password@db:5432/shrymp',
  },
  schema: './src/libs/db/schema.ts',
});
