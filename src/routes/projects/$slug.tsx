import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChipList, EmptyState, Icon, LinkButton, Logo, MarkArt, ThemeToggle } from "#/design-system/ui";
import { absoluteUrl, jsonLd, SITE_URL, seo } from "#/lib/seo";
import { getProject } from "#/server/fn/public";

export const Route = createFileRoute("/projects/$slug")({
	loader: async ({ params }) => {
		const data = await getProject({ data: params.slug });
		if (!data) throw notFound();
		return data;
	},
	head: ({ loaderData, params }) => {
		if (!loaderData) return seo({ title: "Project not found · Mohamed Habib", description: "This project doesn't exist.", path: `/projects/${params.slug}` });
		const { project: pr, owner } = loaderData;
		const path = `/projects/${pr.slug}`;
		const base = seo({
			title: `${pr.title} — ${pr.subtitle || pr.category} · Mohamed Habib`,
			description: pr.summary.slice(0, 160),
			path,
			// Social crawlers don't render SVG, so generated covers fall back to the PNG icon.
			image: pr.imageUrl && !pr.imageUrl.endsWith(".svg") ? pr.imageUrl : undefined,
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
			creator: { "@type": "Person", name: owner?.name ?? "Mohamed Habib", url: SITE_URL },
		};
		const crumbs = {
			"@context": "https://schema.org",
			"@type": "BreadcrumbList",
			itemListElement: [
				{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
				{ "@type": "ListItem", position: 2, name: "Projects", item: `${SITE_URL}/#work` },
				{ "@type": "ListItem", position: 3, name: pr.title, item: absoluteUrl(path) },
			],
		};
		return { ...base, scripts: [jsonLd(work), jsonLd(crumbs)] };
	},
	notFoundComponent: () => (
		<main id="main" className="site" style={{ padding: "96px 0" }}>
			<EmptyState icon="search" title="Project not found" description="It may have been renamed or unpublished." action={<LinkButton href="/#work">Back to projects</LinkButton>} />
		</main>
	),
	component: ProjectPage,
});

function ProjectPage() {
	const { project: pr, related } = Route.useLoaderData();
	const paragraphs = pr.description.split(/\n{2,}/).map((t) => t.trim()).filter(Boolean);
	return (
		<>
			<header className="site-header">
				<div className="site site-header__inner">
					<Logo size={26} href="/" />
					<nav className="site-nav" aria-label="Breadcrumb">
						<Link to="/" hash="work">Projects</Link>
					</nav>
					<ThemeToggle />
					<LinkButton href="/#contact" size="sm">Hire me</LinkButton>
				</div>
			</header>

			<main id="main" className="site">
				<article className="project-detail" aria-labelledby="project-title">
					<section className="mh-hero">
						<MarkArt className="mh-hero__art" position="right" />
						<span className="mh-hero__eyebrow">{[pr.category, pr.year].filter(Boolean).join(" · ")}</span>
						<h1 className="mh-hero__title" id="project-title">{pr.title}{pr.subtitle && <em> — {pr.subtitle}</em>}</h1>
						<p className="mh-hero__lead">{pr.summary}</p>
						<div className="mh-hero__actions">
							{pr.url && <LinkButton href={pr.url} target="_blank" rel="noopener noreferrer" size="lg" trailingIcon="arrow-up-right">Visit live site</LinkButton>}
							<LinkButton href="/#contact" size="lg" variant="outline">Discuss a similar project</LinkButton>
						</div>
					</section>

					<figure className="mh-project__media project-detail__cover">
						<img src={pr.imageUrl || `/og/projects/${pr.slug}.svg`} alt={`${pr.title} — ${pr.subtitle}`} width={1200} height={630} />
					</figure>

					<div className="mh-grid-2 site-section">
						<div className="mh-card">
							{pr.role && <><span className="mh-card__eyebrow">My role</span><p>{pr.role}</p></>}
							{pr.challenge && <><span className="mh-card__eyebrow">The challenge</span><p>{pr.challenge}</p></>}
							<span className="mh-card__eyebrow">Stack</span>
							<ChipList items={pr.tech} label="Stack" />
						</div>
						<div className="mh-card">
							<span className="mh-card__eyebrow">Overview</span>
							{(paragraphs.length ? paragraphs : [pr.summary]).map((t) => <p key={t}>{t}</p>)}
						</div>
					</div>

					<div className="mh-grid-2 site-section">
						{pr.features.length > 0 && (
							<section className="mh-card" aria-labelledby="features-title">
								<h2 className="mh-card__eyebrow" id="features-title">Key features</h2>
								<ul className="project-detail__list">{pr.features.map((f) => <li key={f}><Icon name="check" size={16} />{f}</li>)}</ul>
							</section>
						)}
						{pr.outcomes.length > 0 && (
							<section className="mh-card" aria-labelledby="outcomes-title">
								<h2 className="mh-card__eyebrow" id="outcomes-title">Outcomes</h2>
								<ul className="project-detail__list">{pr.outcomes.map((o) => <li key={o}><Icon name="arrow-right" size={16} />{o}</li>)}</ul>
							</section>
						)}
					</div>
				</article>

				{related.length > 0 && (
					<nav className="site-section" aria-label="More projects">
						<h2 className="mh-card__eyebrow">More projects</h2>
						<div className="mh-grid-3">
							{related.map((r) => (
								<Link key={r.slug} className="mh-card" to="/projects/$slug" params={{ slug: r.slug }}>
									<span className="mh-card__eyebrow">{r.category}</span>
									<h3 className="mh-project__title">{r.title}<Icon name="arrow-right" size={16} /></h3>
									<p className="mh-project__desc">{r.subtitle}</p>
								</Link>
							))}
						</div>
					</nav>
				)}
			</main>
		</>
	);
}
