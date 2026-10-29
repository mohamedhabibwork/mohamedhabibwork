import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema.ts";

export type Db = ReturnType<typeof drizzle<typeof schema>>;

/** Connection string from DATABASE_URL; fails fast when it is missing. */
function databaseUrl(): string {
	const url = process.env.DATABASE_URL;
	if (!url) throw new Error("No database configured: set DATABASE_URL");
	return url;
}

/**
 * Runs `fn` with a database connection scoped to this call.
 * Each call opens a small pool and closes it, so no sockets are held between requests.
 */
export async function withDb<T>(fn: (db: Db) => Promise<T>): Promise<T> {
	const pool = new Pool({ connectionString: databaseUrl(), max: 1 });
	try {
		return await fn(drizzle(pool, { schema }));
	} finally {
		await pool.end();
	}
}
