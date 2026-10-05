import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { withDb } from "#/db";
import { cvs } from "#/db/schema";
import { isSignedIn } from "#/server/auth";
import { CV_TEMPLATES, type CvTemplate } from "#/server/cv-schema";
import { renderCvPdf } from "#/server/pdf";

/**
 * GET /api/cv/<slug>/pdf — builds the CV's PDF on demand, always from the latest saved version.
 * Public CVs: anyone. Private CVs: the signed-in owner only (404 otherwise, so they don't leak).
 * Query: ?template=modern|classic|compact  &accent=<hex without #>  &download=1
 */
export const Route = createFileRoute("/api/cv/$slug/pdf")({
	server: {
		handlers: {
			GET: async ({ request, params }) => {
				const slug = params.slug.toLowerCase();
				if (!/^[a-z0-9-]{1,80}$/.test(slug)) return new Response("Not found", { status: 404 });
				const row = await withDb((db) => db.query.cvs.findFirst({ where: eq(cvs.slug, slug) }));
				if (!row) return new Response("Not found", { status: 404 });
				const owner = row.isPublic ? false : await isSignedIn();
				if (!row.isPublic && !owner) return new Response("Not found", { status: 404 });

				const url = new URL(request.url);
				const t = url.searchParams.get("template");
				const template: CvTemplate = (CV_TEMPLATES as readonly string[]).includes(t ?? "") ? (t as CvTemplate) : (row.template as CvTemplate);
				const a = url.searchParams.get("accent");
				const accent = a && /^[0-9a-f]{6}$/i.test(a) ? `#${a}` : row.accent;

				const bytes = await renderCvPdf(row.data, { template, accent, title: row.title });
				const filename = `${row.data.name.replace(/[^a-z0-9]+/gi, "-")}-${row.slug}.pdf`.replace(/^-+/, "");
				return new Response(bytes as Uint8Array<ArrayBuffer>, {
					headers: {
						"content-type": "application/pdf",
						"content-disposition": `${url.searchParams.get("download") ? "attachment" : "inline"}; filename="${filename}"`,
						"cache-control": row.isPublic ? "public, max-age=60, s-maxage=300" : "private, no-store",
						"x-robots-tag": row.isPublic ? "index" : "noindex",
					},
				});
			},
		},
	},
});
