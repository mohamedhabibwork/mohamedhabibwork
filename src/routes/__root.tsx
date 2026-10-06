import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "#/components/site";
import { EmptyState, LinkButton, themeBootScript } from "#/design-system/ui";
import { pageTitle } from "#/lib/seo";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

/** Search Console / Bing Webmaster ownership tokens, set at build time (optional — DNS verification also works). */
const SITE_VERIFICATION = [
	{ name: "google-site-verification", content: import.meta.env.VITE_GOOGLE_SITE_VERIFICATION as string | undefined },
	{ name: "msvalidate.01", content: import.meta.env.VITE_BING_SITE_VERIFICATION as string | undefined },
].filter((m): m is { name: string; content: string } => Boolean(m.content));

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ name: "theme-color", content: "#0b0d0a" },
			{ name: "author", content: "Mohamed Habib" },
			// Indexing is the default; this only lets Google show large image previews. Private routes add noindex.
			{ name: "robots", content: "max-image-preview:large, max-snippet:-1" },
			...SITE_VERIFICATION,
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
	notFoundComponent: NotFound,
});

/** Unknown URLs: the server answers 404; React 19 hoists the title and robots tag into <head>. */
function NotFound() {
	return (
		<>
			<title>{pageTitle("Page not found")}</title>
			<meta name="robots" content="noindex" />
			<SiteHeader />
			<main id="main" className="site" style={{ padding: "96px 0" }}>
				<EmptyState
					icon="search"
					title="Page not found"
					description="The page you're looking for doesn't exist or has moved."
					action={<LinkButton href="/projects">Browse projects</LinkButton>}
				/>
				<p style={{ textAlign: "center", marginTop: 16 }}><a className="mh-link" href="/">Back to the home page</a></p>
			</main>
			<SiteFooter />
		</>
	);
}

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
