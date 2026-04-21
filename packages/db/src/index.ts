import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import {
	contacts,
	experience,
	industries,
	profile,
	projectCategories,
	projects,
	skillSpecializations,
	skills,
} from "./schema";

dotenv.config({ path: "../../apps/server/.env" });

export function createDb() {
	const pool = new Pool({
		connectionString:
			process.env.DATABASE_URL ||
			"postgresql://postgres:@localhost:5432/profile",
		maxUses: 1,
	});

	return drizzle({
		client: pool,
		schema: {
			contacts,
			experience,
			industries,
			profile,
			projectCategories,
			projects,
			skillSpecializations,
			skills,
		},
	});
}
