import { createFileRoute } from "@tanstack/react-router";
import { desc, eq } from "drizzle-orm";
import { withDb } from "#/db";
import { projects, services } from "#/db/schema";
import { absoluteUrl } from "#/lib/seo";

const escapeXml = (s: string) => s.replace(/[<>&'"]/g, (c) => `&#${c.charCodeAt(0)};`);

export const Route = createFileRoute("/sitemap.xml")({
	server: {
		handlers: {
			GET: async () => {
				const [rows, svc] = await withDb((db) =>
					Promise.all([
						db.select({ slug: projects.slug, imageUrl: projects.imageUrl, updatedAt: projects.updatedAt }).from(projects).where(eq(projects.published, true)).orderBy(desc(projects.featured)),
						db.select({ slug: services.slug, updatedAt: services.updatedAt }).from(services).where(eq(services.published, true)),
					]),
				);
				const newest = (list: { updatedAt: Date }[]) => list.reduce((max, r) => (r.updatedAt > max ? r.updatedAt : max), new Date(0));
				const latest = newest([...rows, ...svc]);
				const urls: { loc: string; lastmod: Date; priority: string; image?: string }[] = [
					{ loc: absoluteUrl("/"), lastmod: latest, priority: "1.0" },
					{ loc: absoluteUrl("/projects"), lastmod: newest(rows), priority: "0.9" },
					{ loc: absoluteUrl("/services"), lastmod: newest(svc), priority: "0.9" },
					...svc.map((r) => ({ loc: absoluteUrl(`/services/${r.slug}`), lastmod: r.updatedAt, priority: "0.8" })),
					...rows.map((r) => ({ loc: absoluteUrl(`/projects/${r.slug}`), lastmod: r.updatedAt, priority: "0.8", image: absoluteUrl(r.imageUrl || `/og/projects/${r.slug}.svg`) })),
				];
				const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls
					.map((u) => `  <url><loc>${escapeXml(u.loc)}</loc><lastmod>${u.lastmod.toISOString()}</lastmod><priority>${u.priority}</priority>${u.image ? `<image:image><image:loc>${escapeXml(u.image)}</image:loc></image:image>` : ""}</url>`)
					.join("\n")}\n</urlset>\n`;
				return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
			},
		},
	},
});
