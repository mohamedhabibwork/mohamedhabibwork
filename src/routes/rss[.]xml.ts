import { createFileRoute } from "@tanstack/react-router";
import { desc, eq } from "drizzle-orm";
import { withDb } from "#/db";
import { blogPosts } from "#/db/schema";
import { postLocale } from "#/lib/blog";
import { rssXml } from "#/lib/feed";

const FEED_LIMIT = 50;

export const Route = createFileRoute("/rss.xml")({
	server: {
		handlers: {
			GET: async () => {
				const posts = await withDb((db) =>
					db
						.select({
							slug: blogPosts.slug,
							title: blogPosts.title,
							excerpt: blogPosts.excerpt,
							body: blogPosts.body,
							tags: blogPosts.tags,
							publishedAt: blogPosts.publishedAt,
						})
						.from(blogPosts)
						.where(eq(blogPosts.published, true))
						.orderBy(desc(blogPosts.publishedAt))
						.limit(FEED_LIMIT),
				);
				const xml = rssXml(
					posts.map((post) => ({ ...post, locale: postLocale(post) })),
				);
				return new Response(xml, {
					headers: {
						"Content-Type": "application/rss+xml; charset=utf-8",
						"Cache-Control": "public, max-age=3600",
					},
				});
			},
		},
	},
});
