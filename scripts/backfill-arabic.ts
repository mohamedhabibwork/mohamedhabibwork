// Fills empty Arabic columns on a database that already holds portfolio content.
// Unlike the seed it deletes nothing and never overwrites existing English or Arabic text.
// Requires migration 0008. Dry run by default; pass --apply to write.
//   bun scripts/backfill-arabic.ts [--apply]
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../src/db/schema.ts";
import { missingArabic } from "../src/lib/localized.ts";
import { experienceArabic, profileArabic, projectArabic, serviceArabic } from "./arabic-content.ts";

config({ path: [".env.local", ".env"] });

const apply = process.argv.includes("--apply");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function main() {
	await db.transaction(async (tx) => {
		const report = (table: string, key: string, patch: object) => {
			const fields = Object.keys(patch);
			if (fields.length > 0) console.log(`${apply ? "update" : "would update"} ${table} ${key}: ${fields.join(", ")}`);
			return apply && fields.length > 0;
		};

		for (const row of await tx.select().from(schema.profile)) {
			const patch = missingArabic(row, profileArabic);
			if (report("profile", String(row.id), patch)) await tx.update(schema.profile).set(patch).where(eq(schema.profile.id, row.id));
		}
		for (const row of await tx.select().from(schema.experiences)) {
			const twins = experienceArabic[row.company];
			if (!twins) continue;
			const patch = missingArabic(row, twins);
			if (report("experiences", row.company, patch)) await tx.update(schema.experiences).set(patch).where(eq(schema.experiences.id, row.id));
		}
		for (const row of await tx.select().from(schema.projects)) {
			const twins = projectArabic[row.slug];
			if (!twins) continue;
			const patch = missingArabic(row, twins);
			if (report("projects", row.slug, patch)) await tx.update(schema.projects).set(patch).where(eq(schema.projects.id, row.id));
		}
		for (const row of await tx.select().from(schema.services)) {
			const twins = serviceArabic[row.slug];
			if (!twins) continue;
			const patch = missingArabic(row, twins);
			if (report("services", row.slug, patch)) await tx.update(schema.services).set(patch).where(eq(schema.services.id, row.id));
		}
	});
	console.log(apply ? "Done." : "Dry run: nothing written. Pass --apply to write.");
}

main()
	.catch((e) => {
		console.error(e);
		process.exitCode = 1;
	})
	.finally(() => pool.end());
