const FORWARDED_SCHEMES = new Set(["http", "https"]);

/** The URL the visitor asked for. Behind a TLS-terminating proxy `request.url` says `http:`, which would leak into redirects. */
export function publicUrl(request: Request) {
	const url = new URL(request.url);
	const scheme = request.headers
		.get("x-forwarded-proto")
		?.split(",")[0]
		?.trim();
	if (scheme && FORWARDED_SCHEMES.has(scheme)) url.protocol = `${scheme}:`;
	return url;
}
