import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ProjectCard } from "#/components/cards";
import { SiteFooter, SiteHeader } from "#/components/site";
import { EmptyState, SectionHeading, Tabs } from "#/design-system/ui";
import { absoluteUrl, jsonLd, seo } from "#/lib/seo";
import { getProjects } from "#/server/fn/public";

const ALL = "all";

export const Route = createFileRoute("/projects/")({
	loader: () => getProjects(),
	head: ({ loaderData }) => {
		const rows = loaderData ?? [];
		const base = seo({
			title: "Projects · Mohamed Habib",
			description: `${rows.length} platforms built and led across ${[...new Set(rows.map((r) => r.category))].slice(0, 4).join(", ").toLowerCase()} and more.`,
			path: "/projects",
		});
		const list = {
			"@context": "https://schema.org",
			"@type": "ItemList",
			itemListElement: rows.map((r, i) => ({ "@type": "ListItem", position: i + 1, url: absoluteUrl(`/projects/${r.slug}`), name: r.title })),
		};
		return { ...base, scripts: [jsonLd(list)] };
	},
	component: ProjectsPage,
});

function ProjectsPage() {
	const rows = Route.useLoaderData();
	const categories = useMemo(() => [...new Set(rows.map((r) => r.category).filter(Boolean))], [rows]);
	const [tab, setTab] = useState<string>(ALL);
	const shown = tab === ALL ? rows : rows.filter((r) => r.category === tab);
	return (
		<>
			<SiteHeader />
			<main id="main" className="site">
				<section className="site-section">
					<SectionHeading eyebrow="Portfolio" title="All projects" description="Every platform I've built or led, from ride-hailing and emergency dispatch to fintech and ERP." />
					{categories.length > 1 && (
						<Tabs
							label="Filter by category"
							value={tab}
							onChange={setTab}
							items={[{ id: ALL, label: "All", count: rows.length }, ...categories.map((c) => ({ id: c, label: c, count: rows.filter((r) => r.category === c).length }))]}
						/>
					)}
					{shown.length === 0 ? (
						<EmptyState icon="briefcase" title="No projects yet" />
					) : (
						<div className="mh-grid-3" style={{ marginTop: 24 }}>
							{shown.map((pr) => <ProjectCard key={pr.id} project={pr} />)}
						</div>
					)}
				</section>
			</main>
			<SiteFooter />
		</>
	);
}
