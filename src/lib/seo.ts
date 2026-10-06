/** Canonical origin for links, sitemap and structured data. Override with VITE_SITE_URL at build time. */
export const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") || "https://mohamedhabib.work";
export const SITE_NAME = "Mohamed Habib";
/** 1200×630 PNG — social crawlers don't render SVG, and a square icon gets cropped. Rebuild: `python3 brand/build_og.py`. */
export const DEFAULT_OG_IMAGE = { url: "/og-default.png", width: 1200, height: 630, alt: "Mohamed Habib — Senior Full-Stack Engineer & Tech Lead" };
/** Stable JSON-LD node id so every page can reference the same Person. */
export const PERSON_ID = `${SITE_URL}/#person`;

/** Search results cut titles around 60 chars and descriptions around 160. */
export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 160;

export const absoluteUrl = (path: string) => (path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`);

/** Collapse whitespace and cut at a word boundary, adding an ellipsis when shortened. */
export function truncate(text: string, max = DESCRIPTION_MAX) {
	const clean = text.replace(/\s+/g, " ").trim();
	if (clean.length <= max) return clean;
	const cut = clean.slice(0, max - 1);
	const atWord = cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,;:.·—-]+$/, "");
	return `${atWord || cut}…`;
}

/**
 * `<specific> · Mohamed Habib`, falling back to shorter variants so the title stays within
 * TITLE_MAX. Candidates go most to least specific; the last one is used if nothing fits.
 */
export function pageTitle(...candidates: string[]) {
	const titles = candidates.filter(Boolean).map((c) => `${c} · ${SITE_NAME}`);
	return titles.find((t) => t.length <= TITLE_MAX) ?? titles[titles.length - 1] ?? SITE_NAME;
}

type SeoImage = { url: string; width?: number; height?: number; alt?: string };
type SeoInput = { title: string; description: string; path: string; image?: SeoImage; type?: "website" | "article" | "profile"; noindex?: boolean };

/** Title, description, canonical, Open Graph and Twitter tags for a route's `head()`. */
export function seo({ title, description, path, image = DEFAULT_OG_IMAGE, type = "website", noindex = false }: SeoInput) {
	const url = absoluteUrl(path);
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
			{ property: "og:locale", content: "en_US" },
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
		links: [{ rel: "canonical", href: url }],
	};
}

/** BreadcrumbList JSON-LD from `[name, path]` pairs, starting after Home. */
export const breadcrumbs = (...trail: [name: string, path: string][]) => ({
	"@context": "https://schema.org",
	"@type": "BreadcrumbList",
	itemListElement: [["Home", "/"] as const, ...trail].map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: absoluteUrl(path) })),
});

/** A `<script type="application/ld+json">` entry for `head().scripts`. `<` is escaped so data can't close the tag. */
export const jsonLd = (data: unknown) => ({
	type: "application/ld+json",
	children: JSON.stringify(data).replace(/</g, "\\u003c"),
});
