import { createFileRoute } from "@tanstack/react-router";
import { desc, eq } from "drizzle-orm";
import { AR_PROJECTS, AR_SERVICES } from "#/content/ar";
import { withDb } from "#/db";
import { blogPosts, projects, services } from "#/db/schema";
import { dominantPostLocale, postLocale } from "#/lib/blog";
import { absoluteUrl, localizedUrl } from "#/lib/seo";
import type { Locale } from "#/paraglide/runtime";

const escapeXml = (s: string) =>
	s.replace(/[<>&'"]/g, (c) => `&#${c.charCodeAt(0)};`);

export const Route = createFileRoute("/sitemap.xml")({
	server: {
		handlers: {
			GET: async () => {
				const [rows, svc, posts] = await withDb((db) =>
					Promise.all([
						db
							.select({
								slug: projects.slug,
								imageUrl: projects.imageUrl,
								updatedAt: projects.updatedAt,
							})
							.from(projects)
							.where(eq(projects.published, true))
							.orderBy(desc(projects.featured)),
						db
							.select({ slug: services.slug, updatedAt: services.updatedAt })
							.from(services)
							.where(eq(services.published, true)),
						db
							.select({
								slug: blogPosts.slug,
								title: blogPosts.title,
								excerpt: blogPosts.excerpt,
								body: blogPosts.body,
								updatedAt: blogPosts.updatedAt,
							})
							.from(blogPosts)
							.where(eq(blogPosts.published, true))
							.orderBy(desc(blogPosts.publishedAt)),
					]),
				);
				const newest = (list: { updatedAt: Date }[]) =>
					list.reduce(
						(max, r) => (r.updatedAt > max ? r.updatedAt : max),
						new Date(0),
					);
				const latest = newest([...rows, ...svc, ...posts]);
				const BOTH: Locale[] = ["en", "ar"];
				const urls: {
					path: string;
					languages?: Locale[];
					lastmod: Date;
					priority: string;
					image?: string;
				}[] = [
					{ path: "/", lastmod: latest, priority: "1.0" },
					{ path: "/projects", lastmod: newest(rows), priority: "0.9" },
					{ path: "/services", lastmod: newest(svc), priority: "0.9" },
					{
						path: "/blog",
						languages: [dominantPostLocale(posts)],
						lastmod: newest(posts),
						priority: "0.8",
					},
					...svc.map((r) => ({
						path: `/services/${r.slug}`,
						languages: r.slug in AR_SERVICES ? BOTH : (["en"] as Locale[]),
						lastmod: r.updatedAt,
						priority: "0.8",
					})),
					...rows.map((r) => ({
						path: `/projects/${r.slug}`,
						languages: r.slug in AR_PROJECTS ? BOTH : (["en"] as Locale[]),
						lastmod: r.updatedAt,
						priority: "0.8",
						image: absoluteUrl(r.imageUrl || `/og/projects/${r.slug}.svg`),
					})),
					...posts.map((r) => ({
						path: `/blog/${r.slug}`,
						// Posts are written in one language, so only that version is listed.
						languages: [postLocale(r)],
						lastmod: r.updatedAt,
						priority: "0.7",
					})),
				];
				const alternates = (path: string, languages: Locale[]) =>
					languages.length < 2
						? ""
						: [
								...languages.map((l) => [l, l] as const),
								["x-default", languages[0]] as const,
							]
								.map(
									([hreflang, l]) =>
										`<xhtml:link rel="alternate" hreflang="${hreflang}" href="${escapeXml(localizedUrl(path, l))}"/>`,
								)
								.join("");
				const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls
					.flatMap((u) =>
						(u.languages ?? BOTH).map(
							(locale) =>
								`  <url><loc>${escapeXml(localizedUrl(u.path, locale))}</loc><lastmod>${u.lastmod.toISOString()}</lastmod><priority>${u.priority}</priority>${alternates(u.path, u.languages ?? BOTH)}${u.image ? `<image:image><image:loc>${escapeXml(u.image)}</image:loc></image:image>` : ""}</url>`,
						),
					)
					.join("\n")}\n</urlset>\n`;
				return new Response(body, {
					headers: {
						"Content-Type": "application/xml; charset=utf-8",
						"Cache-Control": "public, max-age=3600",
					},
				});
			},
		},
	},
});
