import { type Locale, localizeHref } from "#/paraglide/runtime";

/** Posts shown in the Related section of a blog post. */
export const RELATED_POST_COUNT = 2;

const WORDS_PER_MINUTE = 200;

/** Whole minutes to read `words` words, never less than one. */
export const minutesForWords = (words: number): number =>
	Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));

/** Whole minutes to read `text`, never less than one. */
export const readingMinutes = (text: string): number =>
	minutesForWords(text.trim().split(/\s+/).filter(Boolean).length);

const RTL_SHARE = 0.4;
const ARABIC_LETTER = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g;
const LATIN_LETTER = /[A-Za-z]/g;

/** Text direction for a post: right-to-left when Arabic letters make up enough of the prose (code and links ignored). */
export const textDirection = (...parts: string[]): "rtl" | "ltr" => {
	const prose = parts
		.join("\n")
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/`[^`]*`/g, " ")
		.replace(/https?:\/\/\S+/g, " ");
	const arabic = prose.match(ARABIC_LETTER)?.length ?? 0;
	const latin = prose.match(LATIN_LETTER)?.length ?? 0;
	const letters = arabic + latin;
	return letters > 0 && arabic / letters >= RTL_SHARE ? "rtl" : "ltr";
};

/** The language a post is written in. A post has one language, so this also picks its canonical URL. */
export const postLocale = (post: {
	title: string;
	excerpt?: string | null;
	body?: string;
}): "en" | "ar" =>
	textDirection(post.title, post.excerpt ?? "", post.body ?? "") === "rtl"
		? "ar"
		: "en";

/** The paths of a post and its paired translation, for hreflang. Posts without a pair have one version. */
export const postAlternates = (
	post: { slug: string; title: string; excerpt?: string | null; body?: string },
	translationSlug: string | null | undefined,
) => {
	if (!translationSlug) return undefined;
	const own = `/blog/${post.slug}`;
	const other = `/blog/${translationSlug}`;
	return postLocale(post) === "ar"
		? { en: other, ar: own }
		: { en: own, ar: other };
};

/** Where a post lives: the prefix of the language it's written in, whichever locale is showing. */
export const postHref = (post: { slug: string; locale: Locale }) =>
	localizeHref(`/blog/${post.slug}`, { locale: post.locale });

/** The other-language page for a post: its translation, or the blog index when it has none. */
export const postSwitchPath = (translationSlug: string | null | undefined) =>
	translationSlug ? `/blog/${translationSlug}` : "/blog";

/** The language most posts are written in, for pages that list them. */
export const dominantPostLocale = (locales: ("en" | "ar")[]): "en" | "ar" =>
	locales.filter((locale) => locale === "ar").length * 2 > locales.length
		? "ar"
		: "en";
