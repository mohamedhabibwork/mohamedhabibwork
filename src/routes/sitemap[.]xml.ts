import { createFileRoute } from "@tanstack/react-router";
import { asc, desc, eq } from "drizzle-orm";
import { withDb } from "#/db";
import { blogPosts, experiences, projects, services } from "#/db/schema";
import { dominantPostLocale, postAlternates, postLocale } from "#/lib/blog";
import { escapeXml } from "#/lib/feed";
import {
	hasArabic,
	mostlyArabic,
	PROJECT_TEXT,
	portfolioHasArabic,
	SERVICE_TEXT,
} from "#/lib/localized";
import {
	absoluteUrl,
	bothLocales,
	hreflangLinks,
	type LocalePaths,
	localizedUrl,
} from "#/lib/seo";
import type { Locale } from "#/paraglide/runtime";

type SitemapPage = {
	path: string;
	lastmod: Date;
	priority: string;
	image?: string;
};
type SitemapUrl = Omit<SitemapPage, "path"> & {
	loc: string;
	alternates?: LocalePaths;
};

/** One URL per language when the page is translated, each listing both; otherwise only English. */
const pageUrls = (
	{ path, ...page }: SitemapPage,
	translated: boolean,
): SitemapUrl[] =>
	translated
		? (["en", "ar"] as const).map((locale) => ({
				...page,
				loc: localizedUrl(path, locale),
				alternates: bothLocales(path),
			}))
		: [{ ...page, loc: localizedUrl(path, "en") }];

/** A post lives at one URL in the language it's written in, and lists its paired translation if it has one. */
const postUrl = (
	{ path, ...page }: SitemapPage,
	locale: Locale,
	alternates: LocalePaths | undefined,
): SitemapUrl => ({ ...page, loc: localizedUrl(path, locale), alternates });

export const Route = createFileRoute("/sitemap.xml")({
	server: {
		handlers: {
			GET: async () => {
				const [rows, svc, posts, owner, roles] = await withDb((db) =>
					Promise.all([
						db
							.select()
							.from(projects)
							.where(eq(projects.published, true))
							.orderBy(desc(projects.featured), asc(projects.sort)),
						db
							.select()
							.from(services)
							.where(eq(services.published, true))
							.orderBy(asc(services.sort)),
						db
							.select({
								id: blogPosts.id,
								translationOf: blogPosts.translationOf,
								slug: blogPosts.slug,
								title: blogPosts.title,
								excerpt: blogPosts.excerpt,
								body: blogPosts.body,
								updatedAt: blogPosts.updatedAt,
								coverUrl: blogPosts.coverUrl,
							})
							.from(blogPosts)
							.where(eq(blogPosts.published, true))
							.orderBy(desc(blogPosts.publishedAt)),
						db.query.profile.findFirst(),
						db.select().from(experiences),
					]),
				);
				const newest = (list: { updatedAt: Date }[]) =>
					list.reduce(
						(max, r) => (r.updatedAt > max ? r.updatedAt : max),
						new Date(0),
					);
				const latest = newest([...rows, ...svc, ...posts]);
				const projectArabic = (r: (typeof rows)[number]) =>
					hasArabic(r, PROJECT_TEXT);
				const serviceArabic = (r: (typeof svc)[number]) =>
					hasArabic(r, SERVICE_TEXT);
				const translationSlug = (post: (typeof posts)[number]) =>
					posts.find((p) =>
						post.translationOf
							? p.id === post.translationOf
							: p.translationOf === post.id,
					)?.slug;
				const urls: SitemapUrl[] = [
					...pageUrls(
						{ path: "/", lastmod: latest, priority: "1.0" },
						portfolioHasArabic({
							profile: owner,
							projects: rows,
							services: svc,
							experiences: roles,
						}),
					),
					...pageUrls(
						{ path: "/projects", lastmod: newest(rows), priority: "0.9" },
						mostlyArabic(rows.map(projectArabic)),
					),
					...pageUrls(
						{ path: "/services", lastmod: newest(svc), priority: "0.9" },
						mostlyArabic(svc.map(serviceArabic)),
					),
					{
						loc: localizedUrl(
							"/blog",
							dominantPostLocale(posts.map((p) => postLocale(p))),
						),
						lastmod: newest(posts),
						priority: "0.8",
					},
					...svc.flatMap((r) =>
						pageUrls(
							{
								path: `/services/${r.slug}`,
								lastmod: r.updatedAt,
								priority: "0.8",
							},
							serviceArabic(r),
						),
					),
					...rows.flatMap((r) =>
						pageUrls(
							{
								path: `/projects/${r.slug}`,
								lastmod: r.updatedAt,
								priority: "0.8",
								image: absoluteUrl(r.imageUrl || `/og/projects/${r.slug}.svg`),
							},
							projectArabic(r),
						),
					),
					...posts.map((r) =>
						postUrl(
							{
								path: `/blog/${r.slug}`,
								lastmod: r.updatedAt,
								priority: "0.7",
								image: r.coverUrl || undefined,
							},
							postLocale(r),
							postAlternates(r, translationSlug(r)),
						),
					),
				];
				const xhtmlLinks = (alternates?: LocalePaths) =>
					alternates
						? hreflangLinks(alternates)
								.map(
									({ hreflang, href }) =>
										`<xhtml:link rel="alternate" hreflang="${hreflang}" href="${escapeXml(href)}"/>`,
								)
								.join("")
						: "";
				const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls
					.map(
						(u) =>
							`  <url><loc>${escapeXml(u.loc)}</loc><lastmod>${u.lastmod.toISOString()}</lastmod><priority>${u.priority}</priority>${xhtmlLinks(u.alternates)}${u.image ? `<image:image><image:loc>${escapeXml(u.image)}</image:loc></image:image>` : ""}</url>`,
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
