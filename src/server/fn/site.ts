import { createServerFn } from "@tanstack/react-start";
import { withDb } from "#/db";

/** Owner details every public page shows in its header and footer; one small query per navigation-free load. */
export const getSiteOwner = createServerFn({ method: "GET" }).handler(
	async () =>
		withDb(async (db) => {
			const p = await db.query.profile.findFirst({
				columns: {
					name: true,
					email: true,
					github: true,
					linkedin: true,
					availability: true,
				},
			});
			return p ?? null;
		}),
);

export type SiteOwner = NonNullable<Awaited<ReturnType<typeof getSiteOwner>>>;
