import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect } from "react";
import { Footer } from "#/components/layout/Footer";
import { Header } from "#/components/layout/Header";
import { MotionProvider } from "#/design-system/motion";
import { EmptyState, LinkButton, themeBootScript } from "#/design-system/ui";
import { analyticsBootstrap } from "#/lib/analytics";
import { initFirebaseAnalytics } from "#/lib/firebase";
import { pageTitle, SITE_URL } from "#/lib/seo";
import { m } from "#/paraglide/messages";
import { getLocale, getTextDirection, localizeHref } from "#/paraglide/runtime";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

/** Search Console / Bing Webmaster ownership tokens, set at build time (optional — DNS verification also works). */
const SITE_VERIFICATION = [
	{ name: "google-site-verification", content: import.meta.env.VITE_GOOGLE_SITE_VERIFICATION as string | undefined },
	{ name: "msvalidate.01", content: import.meta.env.VITE_BING_SITE_VERIFICATION as string | undefined },
].filter((m): m is { name: string; content: string } => Boolean(m.content));

/** Google Analytics 4 measurement id, set at build time (.env.production) so local dev isn't tracked. */
const GA_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined)?.trim();
// Shape-checked because the id is embedded in an inline script.
const analyticsScripts = GA_ID && /^G-[A-Z0-9]+$/.test(GA_ID) ? [{ children: analyticsBootstrap(GA_ID, new URL(SITE_URL).hostname) }] : [];

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
		// GA4 tracks client-side navigations itself (enhanced measurement: "page changes based on browser history").
		scripts: analyticsScripts,
	}),
	shellComponent: RootDocument,
	notFoundComponent: NotFound,
});

/** Unknown URLs: the server answers 404; React 19 hoists the title and robots tag into <head>. */
function NotFound() {
	return (
		<>
			<title>{pageTitle(m.not_found_title())}</title>
			<meta name="robots" content="noindex" />
			<Header />
			<main id="main" className="site route-state">
				<EmptyState
					icon="search"
					title={m.not_found_title()}
					description={m.not_found_body()}
					action={<LinkButton href={localizeHref("/projects")}>{m.not_found_cta()}</LinkButton>}
				/>
				<p className="route-state__home">
					<a className="mh-link" href={localizeHref("/")}>
						{m.not_found_home()}
					</a>
				</p>
			</main>
			<Footer owner={null} />
		</>
	);
}

/** Without JavaScript nothing would ever reveal, so scroll-reveal elements start visible. */
const NO_JS_REVEAL = "[data-reveal]{opacity:1!important;transform:none!important;clip-path:none!important}";

function RootDocument({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		void initFirebaseAnalytics();
	}, []);
	const locale = getLocale();
	return (
		<html lang={locale} dir={getTextDirection(locale)} data-theme="dark" suppressHydrationWarning>
			<head>
				{/* biome-ignore lint/security/noDangerouslySetInnerHtml: static theme boot script, no user input */}
				<script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
				<HeadContent />
				<noscript>
					<style>{NO_JS_REVEAL}</style>
				</noscript>
			</head>
			<body>
				<a className="skip-link" href="#main">
					{m.skip_to_content()}
				</a>
				<MotionProvider>{children}</MotionProvider>
				<Scripts />
			</body>
		</html>
	);
}
