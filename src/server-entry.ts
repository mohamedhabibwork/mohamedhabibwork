import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

/** Canonical host; every other domain bound to this Worker 301s here, keeping path and query. */
const CANONICAL_HOST = "mohamedhabib.me";
const REDIRECT_HOSTS = new Set(["www.mohamedhabib.me", "mohamedhabib.work", "www.mohamedhabib.work", "habib.cloud", "www.habib.cloud"]);

export default createServerEntry({
	fetch(request) {
		const url = new URL(request.url);
		if (REDIRECT_HOSTS.has(url.hostname)) {
			url.hostname = CANONICAL_HOST;
			url.protocol = "https:";
			url.port = "";
			return Response.redirect(url.toString(), 301);
		}
		return handler.fetch(request);
	},
});
