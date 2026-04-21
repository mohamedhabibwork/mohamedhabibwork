import { createDb } from "@habib-app/db";

export interface CreateContextOptions {
	request: Request;
}

function parseLocale(acceptLanguage: string | undefined): "en" | "ar" {
	if (!acceptLanguage) {
		return "en";
	}

	const locales = acceptLanguage
		.split(",")
		.map((part) => {
			const [lang] = part.trim().split(";");
			return lang?.trim().toLowerCase() ?? "";
		})
		.filter(Boolean);

	for (const locale of locales) {
		if (locale.startsWith("ar")) {
			return "ar";
		}

		if (locale.startsWith("en")) {
			return "en";
		}
	}

	return "en";
}

export function createContext(options: CreateContextOptions) {
	const db = createDb();
	const locale = parseLocale(
		options.request.headers.get("accept-language") ?? undefined
	);

	return {
		auth: null,
		session: null,
		db,
		locale,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
