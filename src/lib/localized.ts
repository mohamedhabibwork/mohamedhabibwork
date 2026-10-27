import { z } from "zod";

/** Languages the database content is written in. English is the source; Arabic twins live in `*Ar` columns. */
export const CONTENT_LOCALES = ["en", "ar"] as const;
export type ContentLocale = (typeof CONTENT_LOCALES)[number];

export const contentLocaleSchema = z.enum(CONTENT_LOCALES).default("en");

type Translatable = string | string[];

function hasContent(value: Translatable | null | undefined): boolean {
	if (value == null) return false;
	return Array.isArray(value)
		? value.some((line) => line.trim() !== "")
		: value.trim() !== "";
}

/** The Arabic value when the locale is Arabic and it has content, otherwise the English one. */
export function localized<T extends Translatable>(
	locale: ContentLocale,
	en: T,
	ar: T | null | undefined,
): T {
	return locale === "ar" && ar != null && hasContent(ar) ? ar : en;
}

type ArKey<K extends string> = `${K}Ar`;

/**
 * Returns a copy of `row` where each field in `fields` holds its localized value
 * and the `*Ar` twins are dropped, so callers see the same shape for every locale.
 */
export function localizeRow<
	R extends Record<string, unknown>,
	K extends string & keyof R,
>(row: R, fields: readonly K[], locale: ContentLocale): Omit<R, ArKey<K>> {
	const twins = new Set<string>(fields.map((f) => `${f}Ar`));
	const localizedFields = Object.fromEntries(
		fields.map((f) => [
			f,
			localized(
				locale,
				row[f] as Translatable,
				row[`${f}Ar`] as Translatable | null | undefined,
			),
		]),
	);
	const kept = Object.fromEntries(
		Object.entries(row).filter(([key]) => !twins.has(key)),
	);
	return { ...kept, ...localizedFields } as Omit<R, ArKey<K>>;
}
