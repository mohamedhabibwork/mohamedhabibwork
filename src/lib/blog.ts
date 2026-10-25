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
