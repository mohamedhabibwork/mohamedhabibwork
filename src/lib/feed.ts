import { dominantPostLocale } from "#/lib/blog";
import { localizedUrl, SITE_NAME, SITE_URL, truncate } from "#/lib/seo";
import type { Locale } from "#/paraglide/runtime";

export const escapeXml = (s: string) =>
	s.replace(/[<>&'"]/g, (c) => `&#${c.charCodeAt(0)};`);

export const RSS_PATH = "/rss.xml";
export const RSS_TITLE = `${SITE_NAME} — Blog`;

type FeedPost = {
	slug: string;
	title: string;
	excerpt: string;
	body?: string;
	tags: string[];
	publishedAt: Date | null;
	locale: Locale;
};

const rssItem = (post: FeedPost) => {
	const url = escapeXml(localizedUrl(`/blog/${post.slug}`, post.locale));
	return [
		"<item>",
		`<title>${escapeXml(post.title)}</title>`,
		`<link>${url}</link>`,
		`<guid isPermaLink="true">${url}</guid>`,
		post.publishedAt
			? `<pubDate>${post.publishedAt.toUTCString()}</pubDate>`
			: "",
		`<description>${escapeXml(truncate(post.excerpt || post.body || ""))}</description>`,
		...post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`),
		"</item>",
	].join("");
};

/** RSS 2.0 for the given posts, newest first. Each item links to the post's canonical URL. */
export function rssXml(posts: FeedPost[]) {
	const locale = dominantPostLocale(posts.map((p) => p.locale));
	const channel = [
		`<title>${escapeXml(RSS_TITLE)}</title>`,
		`<link>${escapeXml(localizedUrl("/blog", locale))}</link>`,
		`<description>${escapeXml(RSS_TITLE)}</description>`,
		`<language>${locale}</language>`,
		`<atom:link href="${SITE_URL}${RSS_PATH}" rel="self" type="application/rss+xml"/>`,
		...posts.map(rssItem),
	].join("\n");
	return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n${channel}\n</channel>\n</rss>\n`;
}
