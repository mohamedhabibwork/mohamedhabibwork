import { m } from "#/paraglide/messages";
import { getLocale, type Locale, localizeHref } from "#/paraglide/runtime";

/** Canonical origin for links, sitemap and structured data. Override with VITE_SITE_URL at build time. */
export const SITE_URL =
	(import.meta.env?.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") ||
	"https://mohamedhabib.work";
export const SITE_NAME = "Mohamed Habib";
/** 1200×630 PNG — social crawlers don't render SVG, and a square icon gets cropped. Rebuild: `python3 brand/build_og.py`. */
export const DEFAULT_OG_IMAGE = {
	url: "/og-default.png",
	width: 1200,
	height: 630,
	alt: "Mohamed Habib — Senior Full-Stack Engineer & Team Leader",
};
/** Stable JSON-LD node id so every page can reference the same Person. */
export const PERSON_ID = `${SITE_URL}/#person`;

/** Search results cut titles around 60 chars and descriptions around 160. */
export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 160;

export const absoluteUrl = (path: string) =>
	path.startsWith("http")
		? path
		: `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

/** Absolute URL of `path` in `locale`: `/ar/blog` for Arabic, unprefixed English. */
export const localizedUrl = (path: string, locale: Locale) =>
	absoluteUrl(localizeHref(path, { locale }));

/** Open Graph locale codes. `ar_AR` is Meta's umbrella code for Arabic, not a typo for a country. */
const OG_LOCALE: Record<Locale, string> = { en: "en_US", ar: "ar_AR" };

/** The path of a page in each language. Translated rows share a path; paired blog posts don't. */
export type LocalePaths = Record<Locale, string>;

export const bothLocales = (path: string): LocalePaths => ({
	en: path,
	ar: path,
});

/** The hreflang set for a page with both language versions. `x-default` is English. */
export const hreflangLinks = (paths: LocalePaths) => [
	{ hreflang: "en", href: localizedUrl(paths.en, "en") },
	{ hreflang: "ar", href: localizedUrl(paths.ar, "ar") },
	{ hreflang: "x-default", href: localizedUrl(paths.en, "en") },
];

/**
 * The `seo()` fields of a page at `path`, given whether its main content has an Arabic version.
 * Translated: each language canonicalizes to itself and lists the other. Untranslated: the
 * `/ar` URL shows English content, so it canonicalizes to the English page.
 */
export const pageLocale = (path: string, translated: boolean) =>
	translated
		? { path, contentLocale: getLocale(), alternates: bothLocales(path) }
		: { path, contentLocale: "en" as Locale };

/** Collapse whitespace and cut at a word boundary, adding an ellipsis when shortened. */
export function truncate(text: string, max = DESCRIPTION_MAX) {
	const clean = text.replace(/\s+/g, " ").trim();
	if (clean.length <= max) return clean;
	const cut = clean.slice(0, max - 1);
	const atWord = cut
		.slice(0, cut.lastIndexOf(" "))
		.replace(/[\s,;:.·—-]+$/, "");
	return `${atWord || cut}…`;
}

/**
 * `<specific> · Mohamed Habib`, falling back to shorter variants so the title stays within
 * TITLE_MAX. Candidates go most to least specific; the last one is used if nothing fits.
 */
export function pageTitle(...candidates: string[]) {
	const parts = candidates.filter(Boolean);
	const suffix = ` · ${SITE_NAME}`;
	const fitting = parts.find((c) => c.length + suffix.length <= TITLE_MAX);
	if (fitting) return `${fitting}${suffix}`;
	// Nothing fits: shorten the least specific candidate at a word boundary, keeping the brand.
	const last = parts[parts.length - 1];
	return last
		? `${truncate(last, TITLE_MAX - suffix.length)}${suffix}`
		: SITE_NAME;
}

type SeoImage = { url: string; width?: number; height?: number; alt?: string };
type SeoInput = {
	title: string;
	description: string;
	path: string;
	image?: SeoImage;
	type?: "website" | "article" | "profile";
	noindex?: boolean;
	/** The language of the page's main content. A page whose content exists in one language has one canonical URL, whichever locale prefix served it. */
	contentLocale?: Locale;
	/** The page's path in each language, when it has both. Adds hreflang tags. */
	alternates?: LocalePaths;
};

/** Title, description, canonical, Open Graph and Twitter tags for a route's `head()`. */
export function seo({
	title,
	description,
	path,
	image = DEFAULT_OG_IMAGE,
	type = "website",
	noindex = false,
	contentLocale = "en",
	alternates,
}: SeoInput) {
	const url = localizedUrl(alternates?.[contentLocale] ?? path, contentLocale);
	const img = absoluteUrl(image.url);
	const desc = truncate(description);
	const alt = image.alt ?? title;
	return {
		meta: [
			{ title },
			{ name: "description", content: desc },
			...(noindex ? [{ name: "robots", content: "noindex, follow" }] : []),
			{ property: "og:type", content: type },
			{ property: "og:site_name", content: SITE_NAME },
			{ property: "og:locale", content: OG_LOCALE[contentLocale] },
			...(alternates
				? [
						{
							property: "og:locale:alternate",
							content: OG_LOCALE[contentLocale === "ar" ? "en" : "ar"],
						},
					]
				: []),
			{ property: "og:title", content: title },
			{ property: "og:description", content: desc },
			{ property: "og:url", content: url },
			{ property: "og:image", content: img },
			...(image.width && image.height
				? [
						{ property: "og:image:width", content: String(image.width) },
						{ property: "og:image:height", content: String(image.height) },
					]
				: []),
			{ property: "og:image:alt", content: alt },
			{ name: "twitter:card", content: "summary_large_image" },
			{ name: "twitter:title", content: title },
			{ name: "twitter:description", content: desc },
			{ name: "twitter:image", content: img },
			{ name: "twitter:image:alt", content: alt },
		],
		links: [
			{ rel: "canonical", href: url },
			...(alternates
				? hreflangLinks(alternates).map(({ hreflang, href }) => ({
						rel: "alternate",
						hrefLang: hreflang,
						href,
					}))
				: []),
		],
	};
}

/** BreadcrumbList JSON-LD in `locale` from `[name, path]` pairs, starting after Home. */
export const breadcrumbs = (
	locale: Locale,
	...trail: [name: string, path: string][]
) => ({
	"@context": "https://schema.org",
	"@type": "BreadcrumbList",
	itemListElement: [[m.nav_home({}, { locale }), "/"] as const, ...trail].map(
		([name, path], i) => ({
			"@type": "ListItem",
			position: i + 1,
			name,
			item: localizedUrl(path, locale),
		}),
	),
});

/** A `<script type="application/ld+json">` entry for `head().scripts`. `<` is escaped so data can't close the tag. */
export const jsonLd = (data: unknown) => ({
	type: "application/ld+json",
	children: JSON.stringify(data).replace(/</g, "\\u003c"),
});
