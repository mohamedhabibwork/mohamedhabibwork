import { createFileRoute } from "@tanstack/react-router";
import { desc, eq } from "drizzle-orm";
import { withDb } from "#/db";
import { projects } from "#/db/schema";
import { absoluteUrl } from "#/lib/seo";

const escapeXml = (s: string) => s.replace(/[<>&'"]/g, (c) => `&#${c.charCodeAt(0)};`);

export const Route = createFileRoute("/sitemap.xml")({
	server: {
		handlers: {
			GET: async () => {
				const rows = await withDb((db) =>
					db.select({ slug: projects.slug, imageUrl: projects.imageUrl, updatedAt: projects.updatedAt }).from(projects).where(eq(projects.published, true)).orderBy(desc(projects.featured)),
				);
				const latest = rows.reduce((max, r) => (r.updatedAt > max ? r.updatedAt : max), new Date(0));
				const urls = [
					{ loc: absoluteUrl("/"), lastmod: latest, priority: "1.0" },
					...rows.map((r) => ({ loc: absoluteUrl(`/projects/${r.slug}`), lastmod: r.updatedAt, priority: "0.8", image: absoluteUrl(r.imageUrl || `/og/projects/${r.slug}.svg`) })),
				];
				const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls
					.map((u) => `  <url><loc>${escapeXml(u.loc)}</loc><lastmod>${u.lastmod.toISOString()}</lastmod><priority>${u.priority}</priority>${"image" in u ? `<image:image><image:loc>${escapeXml(u.image)}</image:loc></image:image>` : ""}</url>`)
					.join("\n")}\n</urlset>\n`;
				return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
			},
		},
	},
});
