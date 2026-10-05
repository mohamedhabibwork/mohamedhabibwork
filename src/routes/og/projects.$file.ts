import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { withDb } from "#/db";
import { projects } from "#/db/schema";
import { projectCoverSvg } from "#/lib/cover";

export const Route = createFileRoute("/og/projects/$file")({
	server: {
		handlers: {
			GET: async ({ params }) => {
				// `/og/projects/<slug>.svg`
				const slug = params.file.replace(/\.svg$/, "");
				if (slug === params.file) return new Response("Not found", { status: 404 });
				const row = await withDb((db) => db.query.projects.findFirst({ where: eq(projects.slug, slug) }));
				if (!row?.published) return new Response("Not found", { status: 404 });
				return new Response(projectCoverSvg(row), {
					headers: { "Content-Type": "image/svg+xml; charset=utf-8", "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
				});
			},
		},
	},
});
