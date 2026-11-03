import { getLocale } from "#/paraglide/runtime";

type Overlays = typeof import("./localize-ar");

/**
 * Applies the Arabic overlays to loader data on /ar pages. Loaded on demand so English
 * visitors never download the translations.
 */
export const inArabic = async <T>(
	data: T,
	apply: (ar: Overlays, data: T) => T,
): Promise<T> =>
	getLocale() === "ar" ? apply(await import("./localize-ar"), data) : data;
