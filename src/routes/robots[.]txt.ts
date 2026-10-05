import { createFileRoute } from "@tanstack/react-router";
import { absoluteUrl } from "#/lib/seo";

export const Route = createFileRoute("/robots.txt")({
	server: {
		handlers: {
			GET: () =>
				new Response(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /login\nDisallow: /mcp\nDisallow: /api/\n\nSitemap: ${absoluteUrl("/sitemap.xml")}\n`, {
					headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" },
				}),
		},
	},
});
