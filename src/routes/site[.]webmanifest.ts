import { createFileRoute } from "@tanstack/react-router";
import { withDb } from "#/db";

export const Route = createFileRoute("/site.webmanifest")({
	server: {
		handlers: {
			GET: async () => {
				const p = await withDb((db) => db.query.profile.findFirst());
				const name = p?.name ?? "Mohamed Habib";
				const manifest = {
					name: p ? `${name} — ${p.headline}` : name,
					short_name: name,
					description: p?.tagline ?? "",
					start_url: "/",
					display: "standalone",
					background_color: "#0b0d0a",
					theme_color: "#0b0d0a",
					icons: [
						{ src: "/icon-192.png", sizes: "192x192", type: "image/png" },
						{ src: "/icon-512.png", sizes: "512x512", type: "image/png" },
					],
				};
				return Response.json(manifest, { headers: { "Content-Type": "application/manifest+json", "Cache-Control": "public, max-age=86400" } });
			},
		},
	},
});
