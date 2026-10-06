import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

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
		const response = await handler.fetch(request);
		if (!isPreviewHost(url.hostname)) return response;
		const tagged = new Response(response.body, response);
		tagged.headers.set("X-Robots-Tag", "noindex");
		return tagged;
	},
});
