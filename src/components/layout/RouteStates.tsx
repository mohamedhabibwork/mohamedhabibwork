import { type ErrorComponentProps, useRouter } from "@tanstack/react-router";
import { Button, EmptyState } from "#/design-system/ui";
import { m } from "#/paraglide/messages";

/** Shown in place of a route that threw while loading or rendering. */
export function RouteError({ reset }: ErrorComponentProps) {
	const router = useRouter();
	return (
		<main id="main" className="site route-state">
			<EmptyState
				icon="alert-triangle"
				title={m.error_title()}
				description={m.error_body()}
				action={
					<Button
						onClick={() => {
							reset();
							void router.invalidate();
						}}
					>
						{m.error_retry()}
					</Button>
				}
			/>
		</main>
	);
}

/** Shown while a slow route loader is still running. */
export function RoutePending() {
	return (
		<main id="main" className="site route-state" aria-busy="true">
			<span className="mh-spinner mh-spinner--lg" aria-hidden />
			<span className="mh-sr">{m.loading()}</span>
		</main>
	);
}
