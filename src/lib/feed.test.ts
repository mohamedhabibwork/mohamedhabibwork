import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { escapeXml, rssXml } from "#/lib/feed";
import { SITE_URL } from "#/lib/seo";

const post = {
	slug: "a-and-b",
	title: "A & B <tips>",
	excerpt: "Fish & chips",
	tags: ["Node.js"],
	publishedAt: new Date("2026-11-01T09:00:00.000Z"),
	locale: "ar" as const,
};

describe("rssXml", () => {
	const xml = rssXml([post]);

	test("escapes text so a title can't break the XML", () => {
		assert.ok(xml.includes(`<title>${escapeXml(post.title)}</title>`));
		assert.ok(!xml.includes("<tips>"));
	});

	test("links each item to the post's canonical URL", () => {
		const url = `${SITE_URL}/ar/blog/a-and-b`;
		assert.ok(xml.includes(`<link>${url}</link>`));
		assert.ok(xml.includes(`<guid isPermaLink="true">${url}</guid>`));
	});

	test("uses RFC 822 dates and declares its own URL", () => {
		assert.ok(xml.includes("<pubDate>Sun, 01 Nov 2026 09:00:00 GMT</pubDate>"));
		assert.ok(xml.includes(`<atom:link href="${SITE_URL}/rss.xml" rel="self"`));
	});

	test("the channel's language and link follow the language most posts are in", () => {
		assert.ok(xml.includes("<language>ar</language>"));
		assert.ok(xml.includes(`<link>${SITE_URL}/ar/blog</link>`));
	});

	test("falls back to the body when a post has no excerpt", () => {
		const xml = rssXml([{ ...post, excerpt: "", body: "From the body" }]);
		assert.ok(xml.includes("<description>From the body</description>"));
	});

	test("leaves out the date of an unscheduled post", () => {
		assert.ok(!rssXml([{ ...post, publishedAt: null }]).includes("<pubDate>"));
	});
});
