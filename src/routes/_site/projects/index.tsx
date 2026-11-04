import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { WorkIndex } from "#/components/cards";
import { EmptyState, Tabs } from "#/design-system/ui";
import { absoluteUrl, breadcrumbs, jsonLd, pageTitle, seo } from "#/lib/seo";
import { getProjects } from "#/server/fn/public";

const ALL = "all";

export const Route = createFileRoute("/_site/projects/")({
	loader: () => getProjects(),
	head: ({ loaderData }) => {
		const rows = loaderData ?? [];
		const base = seo({
			title: pageTitle("Software Projects & Case Studies", "Projects"),
			description: `${rows.length} platforms built and led across ${[...new Set(rows.map((r) => r.category))].slice(0, 4).join(", ").toLowerCase()} and more.`,
			path: "/projects",
		});
		const list = {
			"@context": "https://schema.org",
			"@type": "ItemList",
			itemListElement: rows.map((r, i) => ({ "@type": "ListItem", position: i + 1, url: absoluteUrl(`/projects/${r.slug}`), name: r.title })),
		};
		return { ...base, scripts: [jsonLd(list), jsonLd(breadcrumbs(["Projects", "/projects"]))] };
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
			<main id="main" className="site">
				<section className="site-section">
					<header className="page-head" style={{ paddingTop: 24 }}>
						<h1>Projects</h1>
						<p>Every platform I've built or led, from ride-hailing and emergency dispatch to fintech and ERP.</p>
					</header>
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
						<div style={{ marginTop: 24 }}><WorkIndex projects={shown} /></div>
					)}
				</section>
			</main>
		</>
	);
}
