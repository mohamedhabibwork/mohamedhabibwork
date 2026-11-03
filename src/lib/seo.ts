import { getLocale, type Locale, localizeHref } from "#/paraglide/runtime";
import { SEO_AR } from "./seo-ar";

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

/** Lets a CDN serve public pages for 5 minutes; browsers always revalidate. */
export const PUBLIC_PAGE_CACHE =
	"public, max-age=0, s-maxage=300, stale-while-revalidate=600";

const ALL_LANGUAGES: readonly Locale[] = ["en", "ar"];

export const absoluteUrl = (path: string) =>
	path.startsWith("http")
		? path
		: `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

/** Absolute URL of a site path in the current language. */
export const pageUrl = (path: string) => localizedUrl(path, getLocale());

/** Picks the value for the current language. */
export const forLocale = <T>(en: T, ar: T): T =>
	getLocale() === "ar" ? ar : en;

/** Absolute URL of `path` in `locale`: `/ar/blog` for Arabic, unprefixed English. */
export const localizedUrl = (path: string, locale: Locale) =>
	absoluteUrl(localizeHref(path, { locale }));

/** Open Graph locale codes. `ar_AR` is Meta's umbrella code for Arabic, not a typo for a country. */
const OG_LOCALE: Record<Locale, string> = { en: "en_US", ar: "ar_AR" };

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
	const name = forLocale(SITE_NAME, SEO_AR.name);
	const suffix = ` · ${name}`;
	const fitting = parts.find((c) => c.length + suffix.length <= TITLE_MAX);
	if (fitting) return `${fitting}${suffix}`;
	// Nothing fits: shorten the least specific candidate at a word boundary, keeping the brand.
	const last = parts[parts.length - 1];
	return last ? `${truncate(last, TITLE_MAX - suffix.length)}${suffix}` : name;
}

type SeoImage = { url: string; width?: number; height?: number; alt?: string };
type SeoInput = {
	title: string;
	description: string;
	path: string;
	image?: SeoImage;
	type?: "website" | "article" | "profile";
	noindex?: boolean;
	/** Languages this page has real content in. A page outside them canonicalizes to the first. */
	languages?: readonly Locale[];
};

/** Title, description, canonical, Open Graph and Twitter tags for a route's `head()`. */
export function seo({
	title,
	description,
	path,
	image = DEFAULT_OG_IMAGE,
	type = "website",
	noindex = false,
	languages = ALL_LANGUAGES,
}: SeoInput) {
	const current = getLocale();
	const locale = languages.includes(current) ? current : languages[0];
	const url = localizedUrl(path, locale);
	const img = absoluteUrl(image.url);
	const desc = truncate(description);
	const alt = image.alt ?? title;
	return {
		meta: [
			{ title },
			{ name: "description", content: desc },
			...(noindex ? [{ name: "robots", content: "noindex, follow" }] : []),
			{ property: "og:type", content: type },
			{ property: "og:site_name", content: forLocale(SITE_NAME, SEO_AR.name) },
			{ property: "og:locale", content: OG_LOCALE[locale] },
			...languages
				.filter((l) => l !== locale)
				.map((l) => ({
					property: "og:locale:alternate",
					content: OG_LOCALE[l],
				})),
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
			...(languages.length > 1
				? [
						...languages.map((l) => ({
							rel: "alternate",
							hrefLang: l,
							href: localizedUrl(path, l),
						})),
						{
							rel: "alternate",
							hrefLang: "x-default",
							href: localizedUrl(path, languages[0]),
						},
					]
				: []),
		],
	};
}

/** BreadcrumbList JSON-LD from `[name, path]` pairs, starting after Home. */
export const breadcrumbs = (...trail: [name: string, path: string][]) => ({
	"@context": "https://schema.org",
	"@type": "BreadcrumbList",
	itemListElement: [
		[forLocale("Home", "الرئيسية"), "/"] as const,
		...trail,
	].map(([name, path], i) => ({
		"@type": "ListItem",
		position: i + 1,
		name,
		item: path.startsWith("http") ? path : pageUrl(path),
	})),
});

/** A `<script type="application/ld+json">` entry for `head().scripts`. `<` is escaped so data can't close the tag. */
export const jsonLd = (data: unknown) => ({
	type: "application/ld+json",
	children: JSON.stringify(data).replace(/</g, "\\u003c"),
});
