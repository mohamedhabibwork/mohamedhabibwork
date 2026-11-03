import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { Footer } from "#/components/layout/Footer";
import { Header } from "#/components/layout/Header";
import { PageTransition } from "#/design-system/motion";
import { inArabic } from "#/lib/localize";
import { PUBLIC_PAGE_CACHE } from "#/lib/seo";
import { getSiteOwner } from "#/server/fn/site";

/** Public site shell: header, footer and the route transition around every public page. */
export const Route = createFileRoute("/_site")({
	loader: async () =>
		inArabic(await getSiteOwner(), (ar, owner) => owner && ar.owner(owner)),
	staleTime: Number.POSITIVE_INFINITY,
	headers: () => ({ "cache-control": PUBLIC_PAGE_CACHE }),
	component: SiteLayout,
});

function SiteLayout() {
	const owner = Route.useLoaderData();
	const { pathname } = useLocation();
	return (
		<>
			<Header />
			<PageTransition routeKey={pathname}>
				<Outlet />
			</PageTransition>
			<Footer owner={owner} />
		</>
	);
}
