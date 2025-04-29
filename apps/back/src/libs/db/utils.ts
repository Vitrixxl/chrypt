import type { PgColumn } from 'drizzle-orm/pg-core';
import { InferColumnsDataTypes, sql } from 'drizzle-orm';

export function jsonAgg<T extends Record<string, PgColumn>>(fields: T) {
  const entries = Object.entries(fields);

  const sqlParts = entries.flatMap(([key, value]) => [
    sql.raw(`'${key}'`),
    value,
  ]);

  return sql<
    InferColumnsDataTypes<T>[]
  >`json_agg(json_build_object(${sql.join(sqlParts, sql.raw(', '))}))`;
}
