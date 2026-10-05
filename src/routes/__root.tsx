import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { themeBootScript } from "#/design-system/ui";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ name: "theme-color", content: "#0b0d0a" },
			{ name: "author", content: "Mohamed Habib" },
			{ name: "robots", content: "index, follow, max-image-preview:large" },
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{ rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
			{ rel: "icon", href: "/favicon.ico", sizes: "48x48" },
			{ rel: "apple-touch-icon", href: "/icon-180.png" },
			{ rel: "manifest", href: "/site.webmanifest" },
			{ rel: "sitemap", type: "application/xml", href: "/sitemap.xml" },
			{ rel: "preload", href: "/brand/fonts/Poppins-400.woff2", as: "font", type: "font/woff2", crossOrigin: "anonymous" },
			{ rel: "preload", href: "/brand/fonts/Barlow-800.woff2", as: "font", type: "font/woff2", crossOrigin: "anonymous" },
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" data-theme="dark" suppressHydrationWarning>
			<head>
				{/* biome-ignore lint/security/noDangerouslySetInnerHtml: static theme boot script, no user input */}
				<script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
				<HeadContent />
			</head>
			<body>
				<a className="skip-link" href="#main">Skip to content</a>
				{children}
				<Scripts />
			</body>
		</html>
	);
}
