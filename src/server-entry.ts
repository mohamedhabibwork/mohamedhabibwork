import { AsyncLocalStorage } from "node:async_hooks";
import handler, { createServerEntry } from "@tanstack/react-start/server-entry";
import {
	baseLocale,
	extractLocaleFromUrl,
	type Locale,
	overwriteGetLocale,
} from "./paraglide/runtime";

/**
 * The locale of the request being rendered, read by Paraglide's `getLocale()` on the server.
 * Set here from the URL (`/ar/...`) instead of with `paraglideMiddleware`, which never resolved
 * requests under the Workers dev runtime.
 */
const requestLocale = new AsyncLocalStorage<Locale>();
overwriteGetLocale(() => requestLocale.getStore() ?? baseLocale);

/** Canonical host; every other domain bound to this Worker 301s here, keeping path and query. */
const CANONICAL_HOST = "mohamedhabib.work";
const REDIRECT_HOSTS = new Set([
	"www.mohamedhabib.work",
	"mohamedhabib.me",
	"www.mohamedhabib.me",
	"habib.cloud",
	"www.habib.cloud",
]);
/** Hosts that serve the site without being the canonical one; kept out of search indexes. */
const isPreviewHost = (host: string) => host.endsWith(".workers.dev");

const permanentRedirect = (url: URL) => Response.redirect(url.toString(), 301);

export default createServerEntry({
	async fetch(request) {
		const url = new URL(request.url);
		if (REDIRECT_HOSTS.has(url.hostname)) {
			url.hostname = CANONICAL_HOST;
			url.protocol = "https:";
			url.port = "";
			return permanentRedirect(url);
		}
		// One URL per page: `/projects/` → `/projects` with a permanent (not 307) redirect.
		if (
			(request.method === "GET" || request.method === "HEAD") &&
			url.pathname.length > 1 &&
			url.pathname.endsWith("/")
		) {
			url.pathname = url.pathname.replace(/\/+$/, "") || "/";
			return permanentRedirect(url);
		}
		const locale = extractLocaleFromUrl(url) ?? baseLocale;
		const response = await requestLocale.run(locale, () =>
			handler.fetch(request),
		);
		if (!isPreviewHost(url.hostname)) return response;
		const tagged = new Response(response.body, response);
		tagged.headers.set("X-Robots-Tag", "noindex");
		return tagged;
	},
});
