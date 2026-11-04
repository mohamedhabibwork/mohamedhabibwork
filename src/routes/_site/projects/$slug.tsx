import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { WorkIndex } from "#/components/cards";
import { ChipList, EmptyState, Icon, LinkButton } from "#/design-system/ui";
import { trackView } from "#/lib/analytics";
import { absoluteUrl, breadcrumbs, jsonLd, PERSON_ID, pageTitle, seo } from "#/lib/seo";
import { getProject } from "#/server/fn/public";

export const Route = createFileRoute("/_site/projects/$slug")({
	loader: async ({ params }) => {
		const data = await getProject({ data: params.slug });
		if (!data) throw notFound();
		return data;
	},
	head: ({ loaderData, params }) => {
		if (!loaderData) return seo({ title: pageTitle("Project not found"), description: "This project doesn't exist.", path: `/projects/${params.slug}`, noindex: true });
		const { project: pr } = loaderData;
		const path = `/projects/${pr.slug}`;
		const base = seo({
			title: pageTitle(`${pr.title} — ${pr.subtitle || pr.category}`, pr.title),
			description: pr.summary,
			path,
			// Social crawlers don't render SVG, so generated covers fall back to the default PNG.
			image: pr.imageUrl && !pr.imageUrl.endsWith(".svg") ? { url: pr.imageUrl, alt: `${pr.title} — ${pr.subtitle}` } : undefined,
			type: "article",
		});
		const work = {
			"@context": "https://schema.org",
			"@type": "CreativeWork",
			name: pr.title,
			headline: `${pr.title} — ${pr.subtitle}`,
			description: pr.summary,
			url: absoluteUrl(path),
			image: absoluteUrl(pr.imageUrl || `/og/projects/${pr.slug}.svg`),
			genre: pr.category,
			keywords: pr.tech.join(", "),
			dateCreated: pr.year,
			...(pr.url ? { sameAs: pr.url } : {}),
			creator: { "@id": PERSON_ID },
		};
		return { ...base, scripts: [jsonLd(work), jsonLd(breadcrumbs(["Projects", "/projects"], [pr.title, path]))] };
	},
	notFoundComponent: () => (
		<main id="main" className="site" style={{ padding: "96px 0" }}>
			<EmptyState icon="search" title="Project not found" description="It may have been renamed or unpublished." action={<LinkButton href="/projects">See all projects</LinkButton>} />
		</main>
	),
	component: ProjectPage,
});

function ProjectPage() {
	const { project: pr, related } = Route.useLoaderData();
	const paragraphs = pr.description.split(/\n{2,}/).map((t) => t.trim()).filter(Boolean);
	useEffect(() => trackView("project", pr.slug, pr.title), [pr.slug, pr.title]);
	return (
		<>

			<main id="main" className="site">
				<article aria-labelledby="project-title">
					<header className="case-head">
						<span className="case-head__crumb"><Link to="/projects">Projects</Link>{pr.category && <> / {pr.category}</>}</span>
						<h1 id="project-title">{pr.title}</h1>
						{(pr.subtitle || pr.summary) && <p className="case-head__sub">{pr.subtitle ? `${pr.subtitle}. ${pr.summary}` : pr.summary}</p>}
					</header>

					<figure className="case-cover">
						<img src={pr.imageUrl || `/og/projects/${pr.slug}.svg`} alt={`${pr.title} — ${pr.subtitle}`} width={1200} height={630} fetchPriority="high" />
					</figure>

					<div className="case">
						<div className="case__body">
							<section aria-labelledby="overview-title">
								<h2 id="overview-title">Overview</h2>
								{(paragraphs.length ? paragraphs : [pr.summary]).map((t) => <p key={t}>{t}</p>)}
							</section>
							{pr.challenge && (
								<section aria-labelledby="challenge-title">
									<h2 id="challenge-title">The challenge</h2>
									<p>{pr.challenge}</p>
								</section>
							)}
							{pr.features.length > 0 && (
								<section aria-labelledby="features-title">
									<h2 id="features-title">What it does</h2>
									<ul className="case__list">{pr.features.map((f) => <li key={f}><Icon name="check" size={16} />{f}</li>)}</ul>
								</section>
							)}
							{pr.outcomes.length > 0 && (
								<section aria-labelledby="outcomes-title">
									<h2 id="outcomes-title">Outcomes</h2>
									<ul className="case__list">{pr.outcomes.map((o) => <li key={o}><Icon name="arrow-right" size={16} />{o}</li>)}</ul>
								</section>
							)}
						</div>
						<aside className="spec" aria-label="Project facts">
							<dl>
								{pr.role && <div><dt>My role</dt><dd>{pr.role}</dd></div>}
								{pr.year && <div><dt>Year</dt><dd>{pr.year}</dd></div>}
								{pr.tech.length > 0 && <div><dt>Stack</dt><dd><ChipList items={pr.tech} label="Stack" /></dd></div>}
							</dl>
							<div className="spec__actions">
								{pr.url && <LinkButton href={pr.url} target="_blank" rel="noopener noreferrer" trailingIcon="arrow-up-right">Visit live site</LinkButton>}
								<LinkButton href="/#contact" variant="outline">Discuss a similar project</LinkButton>
							</div>
						</aside>
					</div>
				</article>

				{related.length > 0 && (
					<nav className="site-section" aria-label="More projects">
						<header className="page-head"><h2>More projects</h2></header>
						<WorkIndex projects={related.map((r) => ({ ...r, summary: r.subtitle }))} />
					</nav>
				)}
			</main>
		</>
	);
}
