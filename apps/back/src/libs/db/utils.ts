import type { InferColumnsDataTypes, SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import { DrizzleError, sql } from "drizzle-orm";

export function jsonAgg<T extends Record<string, PgColumn>>(select: T) {
	const chunks: SQL[] = [];
	const entries = Object.entries(select);

	if (!entries.length) {
		throw new DrizzleError({ message: "Cannot aggregate an empty object" });
	}

	entries.forEach(([key, column], index) => {
		if (index > 0) chunks.push(sql`,`);
		chunks.push(sql.raw(`'${key}',`), sql`${column}`);
	});

	const filterChunks = entries
		.filter(([_, col]) => !col.notNull)
		.map(([_, col]) => col);
	const filterSql = filterChunks.length
		? sql`FILTER (WHERE ${sql.join(filterChunks)} IS NOT NULL)`
		: "";

	return sql<InferColumnsDataTypes<T>[]>`
      COALESCE(json_agg(json_build_object(${sql.join(
				chunks,
			)})) ${filterSql}, '[]')
    `;
}
