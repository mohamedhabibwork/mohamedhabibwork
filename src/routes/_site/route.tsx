import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { Footer } from "#/components/layout/Footer";
import { Header } from "#/components/layout/Header";
import { PageTransition } from "#/design-system/motion";
import { getSiteOwner } from "#/server/fn/site";

/** Public site shell: header, footer and the route transition around every public page. */
export const Route = createFileRoute("/_site")({
	loader: () => getSiteOwner(),
	staleTime: Number.POSITIVE_INFINITY,
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
