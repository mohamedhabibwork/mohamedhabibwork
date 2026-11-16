import { AsyncLocalStorage } from "node:async_hooks";
import handler, { createServerEntry } from "@tanstack/react-start/server-entry";
import { publicUrl } from "./lib/public-url";
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

/** Legacy URLs from earlier site versions that should permanently redirect to `/`. */
const LEGACY_HOME_REDIRECTS = new Set([
	"/index.html",
	"/pdf",
	"/Mohammad_Habib_Senior_Full_Stack_Developer_Resume.pdf",
]);

/** Removed legacy pages that should return 410 Gone so search engines drop them quickly. */
const GONE_PATHS = new Set(["/privacy-policy", "/terms"]);

const isNoindexPath = (pathname: string) =>
	pathname === "/admin" ||
	pathname.startsWith("/admin/") ||
	pathname === "/login" ||
	pathname === "/mcp" ||
	pathname.startsWith("/api/");

export default createServerEntry({
	async fetch(request) {
		const url = publicUrl(request);
		const isRead = request.method === "GET" || request.method === "HEAD";
		if (REDIRECT_HOSTS.has(url.hostname)) {
			url.hostname = CANONICAL_HOST;
			url.protocol = "https:";
			url.port = "";
			return permanentRedirect(url);
		}
		// One URL per page: `/projects/` → `/projects` with a permanent (not 307) redirect.
		if (isRead && url.pathname.length > 1 && url.pathname.endsWith("/")) {
			url.pathname = url.pathname.replace(/\/+$/, "") || "/";
			return permanentRedirect(url);
		}
		if (isRead && LEGACY_HOME_REDIRECTS.has(url.pathname)) {
			url.pathname = "/";
			url.search = "";
			return permanentRedirect(url);
		}
		if (isRead && GONE_PATHS.has(url.pathname)) {
			return new Response("Gone", {
				status: 410,
				headers: {
					"Content-Type": "text/plain; charset=utf-8",
					"X-Robots-Tag": "noindex, nofollow",
					"Cache-Control": "public, max-age=86400",
				},
			});
		}
		const locale = extractLocaleFromUrl(url) ?? baseLocale;
		const response = await requestLocale.run(locale, () =>
			// Redirects from routes are built from this URL, so it needs the public scheme too.
			handler.fetch(isRead ? new Request(url, request) : request),
		);
		const shouldNoindex =
			isPreviewHost(url.hostname) || isNoindexPath(url.pathname);
		if (!shouldNoindex) return response;
		const tagged = new Response(response.body, response);
		tagged.headers.set("X-Robots-Tag", "noindex, nofollow");
		return tagged;
	},
});
