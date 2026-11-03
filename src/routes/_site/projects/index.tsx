import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ProjectCard } from "#/components/cards";
import { EmptyState, SectionHeading, Tabs } from "#/design-system/ui";
import { inArabic } from "#/lib/localize";
import {
	breadcrumbs,
	forLocale,
	jsonLd,
	pageTitle,
	pageUrl,
	seo,
} from "#/lib/seo";
import { SEO_AR } from "#/lib/seo-ar";
import { m } from "#/paraglide/messages";
import { getProjects } from "#/server/fn/public";

const ALL = "all";

export const Route = createFileRoute("/_site/projects/")({
	loader: async () =>
		inArabic(await getProjects(), (ar, rows) => rows.map(ar.project)),
	head: ({ loaderData }) => {
		const rows = loaderData ?? [];
		const base = seo({
			title: forLocale(
				pageTitle("Software Projects & Case Studies", "Projects"),
				pageTitle(SEO_AR.projects.title),
			),
			description: forLocale(
				`${rows.length} platforms built and led across ${[...new Set(rows.map((r) => r.category))].slice(0, 4).join(", ").toLowerCase()} and more.`,
				SEO_AR.projects.description,
			),
			path: "/projects",
		});
		const list = {
			"@context": "https://schema.org",
			"@type": "ItemList",
			itemListElement: rows.map((r, i) => ({
				"@type": "ListItem",
				position: i + 1,
				url: pageUrl(`/projects/${r.slug}`),
				name: r.title,
			})),
		};
		return {
			...base,
			scripts: [
				jsonLd(list),
				jsonLd(breadcrumbs([m.nav_projects(), "/projects"])),
			],
		};
	},
	component: ProjectsPage,
});

function ProjectsPage() {
	const rows = Route.useLoaderData();
	const categories = useMemo(
		() => [...new Set(rows.map((r) => r.category).filter(Boolean))],
		[rows],
	);
	const [tab, setTab] = useState<string>(ALL);
	const shown = tab === ALL ? rows : rows.filter((r) => r.category === tab);
	return (
		<>
			<main id="main" className="site">
				<section className="site-section">
					<SectionHeading
						as="h1"
						eyebrow={m.projects_eyebrow()}
						title={m.projects_title()}
						description={m.projects_description()}
					/>
					{categories.length > 1 && (
						<Tabs
							label={m.projects_filter()}
							value={tab}
							onChange={setTab}
							items={[
								{ id: ALL, label: m.projects_filter_all(), count: rows.length },
								...categories.map((c) => ({
									id: c,
									label: c,
									count: rows.filter((r) => r.category === c).length,
								})),
							]}
						/>
					)}
					{shown.length === 0 ? (
						<EmptyState icon="briefcase" title={m.projects_empty()} />
					) : (
						<div className="mh-grid-3" style={{ marginTop: 24 }}>
							{shown.map((pr) => (
								<ProjectCard key={pr.id} project={pr} />
							))}
						</div>
					)}
				</section>
			</main>
		</>
	);
}
