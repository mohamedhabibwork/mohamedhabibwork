import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { bothLocales, hreflangLinks, SITE_URL, seo } from "#/lib/seo";

const base = { title: "T", description: "D" };
const canonicalOf = (head: ReturnType<typeof seo>) =>
	head.links.find((l) => l.rel === "canonical")?.href;
const hreflangsOf = (head: ReturnType<typeof seo>) =>
	head.links.flatMap((l) => ("hrefLang" in l ? [[l.hrefLang, l.href]] : []));
const metaOf = (head: ReturnType<typeof seo>, property: string) =>
	head.meta.find((m) => "property" in m && m.property === property);

describe("seo", () => {
	test("an article page carries its publish and update dates", () => {
		const head = seo({
			...base,
			path: "/blog/x",
			type: "article",
			article: {
				publishedTime: "2026-11-01T00:00:00.000Z",
				modifiedTime: "2026-11-02T00:00:00.000Z",
				section: "Node.js",
			},
		});
		assert.equal(
			metaOf(head, "article:published_time")?.content,
			"2026-11-01T00:00:00.000Z",
		);
		assert.equal(
			metaOf(head, "article:modified_time")?.content,
			"2026-11-02T00:00:00.000Z",
		);
		assert.equal(metaOf(head, "article:section")?.content, "Node.js");
		assert.equal(metaOf(head, "article:author")?.content, `${SITE_URL}/`);
	});

	test("a page without article data has no article tags", () => {
		const head = seo({ ...base, path: "/blog" });
		assert.equal(metaOf(head, "article:author"), undefined);
	});

	test("an untranslated page has an English canonical and no hreflang", () => {
		const head = seo({ ...base, path: "/projects/too-bus" });
		assert.equal(canonicalOf(head), `${SITE_URL}/projects/too-bus`);
		assert.deepEqual(hreflangsOf(head), []);
		assert.equal(metaOf(head, "og:locale:alternate"), undefined);
	});

	test("a translated page served in Arabic is canonical to itself with reciprocal hreflang", () => {
		const head = seo({
			...base,
			path: "/projects/too-app",
			contentLocale: "ar",
			alternates: bothLocales("/projects/too-app"),
		});
		assert.equal(canonicalOf(head), `${SITE_URL}/ar/projects/too-app`);
		assert.deepEqual(hreflangsOf(head), [
			["en", `${SITE_URL}/projects/too-app`],
			["ar", `${SITE_URL}/ar/projects/too-app`],
			["x-default", `${SITE_URL}/projects/too-app`],
		]);
		assert.deepEqual(metaOf(head, "og:locale"), {
			property: "og:locale",
			content: "ar_AR",
		});
		assert.deepEqual(metaOf(head, "og:locale:alternate"), {
			property: "og:locale:alternate",
			content: "en_US",
		});
	});

	test("the English version of a translated page lists the same hreflang set", () => {
		const head = seo({
			...base,
			path: "/services",
			contentLocale: "en",
			alternates: bothLocales("/services"),
		});
		assert.equal(canonicalOf(head), `${SITE_URL}/services`);
		assert.equal(hreflangsOf(head).length, 3);
	});

	test("paired posts with different slugs point at each other", () => {
		const alternates = { en: "/blog/hello", ar: "/blog/marhaba" };
		const head = seo({
			...base,
			path: "/blog/marhaba",
			contentLocale: "ar",
			alternates,
		});
		assert.equal(canonicalOf(head), `${SITE_URL}/ar/blog/marhaba`);
		assert.deepEqual(hreflangsOf(head)[0], ["en", `${SITE_URL}/blog/hello`]);
	});
});

describe("hreflangLinks", () => {
	test("x-default is the English URL", () => {
		const links = hreflangLinks({ en: "/a", ar: "/b" });
		assert.deepEqual(links.at(-1), {
			hreflang: "x-default",
			href: `${SITE_URL}/a`,
		});
	});
});
