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

/** Translatable columns per table; each has an `*Ar` twin in the schema. */
export const PROFILE_TEXT = [
	"headline",
	"tagline",
	"summary",
	"availability",
] as const;
export const EXPERIENCE_TEXT = ["role", "summary", "highlights"] as const;
export const PROJECT_TEXT = [
	"title",
	"subtitle",
	"summary",
	"description",
	"role",
	"challenge",
	"outcomes",
	"features",
] as const;
export const SERVICE_TEXT = [
	"title",
	"summary",
	"description",
	"deliverables",
] as const;
/** The service columns a card shows, which is all the home page loads. */
export const SERVICE_CARD_TEXT = ["title", "summary"] as const;

/**
 * Whether `row` reads fully in Arabic: every listed field with English content has an Arabic twin.
 * Partly translated rows fall back to English field by field, so they don't count as a translation.
 */
export function hasArabic(
	row: Record<string, unknown>,
	fields: readonly string[],
): boolean {
	return fields.every(
		(f) =>
			!hasContent(row[f] as Translatable | null | undefined) ||
			hasContent(row[`${f}Ar`] as Translatable | null | undefined),
	);
}

/** Whether a page listing several rows reads mostly in Arabic. */
export const mostlyArabic = (translated: boolean[]) =>
	translated.filter(Boolean).length * 2 > translated.length;

const HOME_PROJECT_COUNT = 6;

/** The projects the home page shows: the featured ones, or the first few when none are. */
export function homeProjects<P extends { featured: boolean }>(
	projects: P[],
): P[] {
	const featured = projects.filter((p) => p.featured);
	return (featured.length > 0 ? featured : projects).slice(
		0,
		HOME_PROJECT_COUNT,
	);
}

type PortfolioRows = {
	profile: Record<string, unknown> | null | undefined;
	projects: (Record<string, unknown> & { featured: boolean })[];
	services: Record<string, unknown>[];
	experiences: Record<string, unknown>[];
};

/** Whether the home page has an Arabic version: the profile, and most of the rows it lists. */
export function portfolioHasArabic(data: PortfolioRows): boolean {
	return (
		data.profile != null &&
		hasArabic(data.profile, PROFILE_TEXT) &&
		mostlyArabic([
			...homeProjects(data.projects).map((r) => hasArabic(r, PROJECT_TEXT)),
			...data.services.map((r) => hasArabic(r, SERVICE_CARD_TEXT)),
			...data.experiences.map((r) => hasArabic(r, EXPERIENCE_TEXT)),
		])
	);
}

/** The fields of `twins` whose column on `row` holds no text yet. Admin forms save blank twins as `""` or `[]`. */
export function missingArabic<T extends Record<string, unknown>>(
	row: Record<string, unknown>,
	twins: T,
): Partial<T> {
	return Object.fromEntries(
		Object.entries(twins).filter(
			([key]) => !hasContent(row[key] as Translatable | null | undefined),
		),
	) as Partial<T>;
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
