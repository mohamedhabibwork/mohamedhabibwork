/** Posts shown in the Related section of a blog post. */
export const RELATED_POST_COUNT = 2;

const WORDS_PER_MINUTE = 200;

/** Whole minutes to read `text`, never less than one. */
export const readingMinutes = (text: string): number => {
	const words = text.trim().split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
};

/** Paragraphs are separated by blank lines in the stored body. */
export const paragraphsOf = (text: string): string[] =>
	text
		.split(/\n{2,}/)
		.map((t) => t.trim())
		.filter(Boolean);
