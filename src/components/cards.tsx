import { Link } from "@tanstack/react-router";
import { ChipList, Icon, type IconName } from "#/design-system/ui";
import { postHref, textDirection } from "#/lib/blog";
import { m } from "#/paraglide/messages";
import { getLocale, type Locale } from "#/paraglide/runtime";

type ProjectCardData = {
	slug: string;
	title: string;
	category: string;
	year: string;
	summary: string;
	tech: string[];
	imageUrl: string;
};

export const projectCover = (p: { slug: string; imageUrl: string }) =>
	p.imageUrl || `/og/projects/${p.slug}.svg`;

export function ProjectCard({ project: pr }: { project: ProjectCardData }) {
	return (
		<Link
			className="mh-project"
			to="/projects/$slug"
			params={{ slug: pr.slug }}
		>
			<div className="mh-project__media">
				<img
					src={projectCover(pr)}
					alt=""
					loading="lazy"
					decoding="async"
					width={1200}
					height={630}
				/>
			</div>
			<div className="mh-project__body">
				<div className="mh-project__meta">
					<span>{pr.category}</span>
					<span>{pr.year}</span>
				</div>
				<h3 className="mh-project__title">
					{pr.title}
					<Icon name="arrow-right" size={16} />
				</h3>
				<p className="mh-project__desc">{pr.summary}</p>
				<ChipList items={pr.tech} label={m.common_stack()} />
			</div>
		</Link>
	);
}

type BlogCardData = {
	slug: string;
	locale: Locale;
	title: string;
	excerpt: string;
	tags: string[];
	minutes: number;
};

export function BlogCard({
	post: p,
	headingLevel: Heading = "h3",
}: {
	post: BlogCardData;
	headingLevel?: "h2" | "h3";
}) {
	const [category] = p.tags;
	const dir = textDirection(p.title, p.excerpt);
	const content = (
		<>
			<span className="blog-card__pill">
				{category ? `${category} · ${m.blog_card_minutes({ count: p.minutes })}` : m.blog_card_minutes({ count: p.minutes })}
			</span>
			<Heading className="blog-card__title">{p.title}</Heading>
			{p.excerpt && <p className="blog-card__desc">{p.excerpt}</p>}
		</>
	);
	const attrs = { className: "blog-card", dir, lang: p.locale };
	// Crossing languages takes a full page load, so the server renders the right `lang`/`dir`.
	return p.locale === getLocale() ? (
		<Link {...attrs} to="/blog/$slug" params={{ slug: p.slug }}>
			{content}
		</Link>
	) : (
		<a {...attrs} href={postHref(p)}>
			{content}
		</a>
	);
}

type ServiceCardData = {
	slug: string;
	title: string;
	icon: string;
	summary: string;
	startingAt?: string;
};

export function ServiceCard({ service: s }: { service: ServiceCardData }) {
	return (
		<Link
			className="mh-card service-card"
			to="/services/$slug"
			params={{ slug: s.slug }}
		>
			<span className="service-card__icon" aria-hidden>
				<Icon name={s.icon as IconName} size={22} />
			</span>
			<h3 className="mh-project__title">
				{s.title}
				<Icon name="arrow-right" size={16} />
			</h3>
			<p className="mh-project__desc">{s.summary}</p>
			{s.startingAt && <span className="mh-card__eyebrow">{s.startingAt}</span>}
		</Link>
	);
}
