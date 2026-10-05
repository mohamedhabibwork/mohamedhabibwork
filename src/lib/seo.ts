/** Canonical origin for links, sitemap and structured data. Override with VITE_SITE_URL at build time. */
export const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") || "https://mohamedhabib.work";
export const SITE_NAME = "Mohamed Habib";
export const DEFAULT_OG_IMAGE = "/icon-512.png";

export const absoluteUrl = (path: string) => (path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`);

type SeoInput = { title: string; description: string; path: string; image?: string; type?: "website" | "article" | "profile" };

/** Title, description, canonical, Open Graph and Twitter tags for a route's `head()`. */
export function seo({ title, description, path, image = DEFAULT_OG_IMAGE, type = "website" }: SeoInput) {
	const url = absoluteUrl(path);
	const img = absoluteUrl(image);
	return {
		meta: [
			{ title },
			{ name: "description", content: description },
			{ property: "og:type", content: type },
			{ property: "og:site_name", content: SITE_NAME },
			{ property: "og:title", content: title },
			{ property: "og:description", content: description },
			{ property: "og:url", content: url },
			{ property: "og:image", content: img },
			{ name: "twitter:card", content: "summary_large_image" },
			{ name: "twitter:title", content: title },
			{ name: "twitter:description", content: description },
			{ name: "twitter:image", content: img },
		],
		links: [{ rel: "canonical", href: url }],
	};
}

/** A `<script type="application/ld+json">` entry for `head().scripts`. `<` is escaped so data can't close the tag. */
export const jsonLd = (data: unknown) => ({
	type: "application/ld+json",
	children: JSON.stringify(data).replace(/</g, "\\u003c"),
});
