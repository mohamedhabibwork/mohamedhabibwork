import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { WorkIndex } from "#/components/cards";
import { EmptyState, SectionHeading, Tabs } from "#/design-system/ui";
import { mostlyArabic } from "#/lib/localized";
import {
	breadcrumbs,
	jsonLd,
	localizedUrl,
	pageLocale,
	pageTitle,
	seo,
} from "#/lib/seo";
import { getProjects } from "#/server/fn/public";
import { m } from "#/paraglide/messages";
import { getLocale } from "#/paraglide/runtime";

const ALL = "all";

export const Route = createFileRoute("/_site/projects/")({
	loader: () => getProjects({ data: { locale: getLocale() } }),
	head: ({ loaderData }) => {
		const rows = loaderData ?? [];
		const page = pageLocale("/projects", mostlyArabic(rows.map((r) => r.hasArabic)));
		const { contentLocale: locale } = page;
		const base = seo({
			title: pageTitle(m.projects_seo_title({}, { locale }), m.nav_projects({}, { locale })),
			description: m.projects_seo_description({ count: rows.length, categories: [...new Set(rows.map((r) => r.category))].slice(0, 4).join(", ").toLowerCase() }, { locale }),
			...page,
		});
		const list = {
			"@context": "https://schema.org",
			"@type": "ItemList",
			itemListElement: rows.map((r, i) => ({ "@type": "ListItem", position: i + 1, url: localizedUrl(`/projects/${r.slug}`, r.hasArabic ? locale : "en"), name: r.title })),
		};
		return { ...base, scripts: [jsonLd(list), jsonLd(breadcrumbs(locale, [m.nav_projects({}, { locale }), "/projects"]))] };
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
					<SectionHeading as="h1" eyebrow={m.projects_eyebrow()} title={m.projects_title()} description={m.projects_description()} />
					{categories.length > 1 && (
						<Tabs
							label={m.projects_filter()}
							value={tab}
							onChange={setTab}
							items={[{ id: ALL, label: m.projects_filter_all(), count: rows.length }, ...categories.map((c) => ({ id: c, label: c, count: rows.filter((r) => r.category === c).length }))]}
						/>
					)}
					{shown.length === 0 ? (
						<EmptyState icon="briefcase" title={m.projects_empty()} />
					) : (
						<div style={{ marginTop: 24 }}><WorkIndex projects={shown} /></div>
					)}
				</section>
			</main>
		</>
	);
}
