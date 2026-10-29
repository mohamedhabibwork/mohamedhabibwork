import { paraglideVitePlugin } from "@inlang/paraglide-js";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

const config = defineConfig({
	resolve: { tsconfigPaths: true },
	plugins: [
		devtools(),
		paraglideVitePlugin({
			project: "./project.inlang",
			outdir: "./src/paraglide",
			strategy: ["url", "baseLocale"],
			// Matches the server's one-URL-per-page rule: `/ar`, never `/ar/`.
			trailingSlash: "never",
		}),
		tailwindcss(),
		tanstackStart({ server: { entry: "server-entry.ts" } }),
		nitro({ preset: "node-server" }),
		viteReact(),
	],
});

export default config;
