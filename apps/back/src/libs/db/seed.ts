import { seed } from 'drizzle-seed';
import { db } from '.';
import * as schema from './schema';
async function main() {
  await seed(db, schema, { count: 100 });
}

main();
