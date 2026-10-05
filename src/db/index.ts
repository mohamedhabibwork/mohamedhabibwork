import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema.ts";

export type Db = ReturnType<typeof drizzle<typeof schema>>;

type HyperdriveBinding = { connectionString: string };

/** Hyperdrive on Workers; DATABASE_URL for scripts and plain Node. */
async function databaseUrl(): Promise<string> {
	try {
		const { env } = (await import("cloudflare:workers")) as { env: { HYPERDRIVE?: HyperdriveBinding } };
		if (env.HYPERDRIVE?.connectionString) return env.HYPERDRIVE.connectionString;
	} catch {
		// Not running on Workers — fall through to DATABASE_URL.
	}
	const url = process.env.DATABASE_URL;
	if (!url) throw new Error("No database configured: bind HYPERDRIVE or set DATABASE_URL");
	return url;
}

/**
 * Runs `fn` with a database connection scoped to this call.
 * Workers can't share sockets across requests, so each call opens a small pool and closes it.
 */
export async function withDb<T>(fn: (db: Db) => Promise<T>): Promise<T> {
	const pool = new Pool({ connectionString: await databaseUrl(), max: 1 });
	try {
		return await fn(drizzle(pool, { schema }));
	} finally {
		await pool.end();
	}
}
