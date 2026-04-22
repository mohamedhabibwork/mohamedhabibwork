import { createDb } from "@habib-app/db";

export interface Env {
	SMTP_FROM: string;
	SMTP_HOST: string;
	SMTP_PASS: string;
	SMTP_PORT: string;
	SMTP_TO: string;
	SMTP_USER: string;
}

export interface CreateContextOptions {
	env?: Env;
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
		env: options.env ?? {
			SMTP_HOST: "",
			SMTP_PORT: "587",
			SMTP_USER: "",
			SMTP_PASS: "",
			SMTP_FROM: "noreply@mohamedhabib.work",
			SMTP_TO: "",
		},
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
