import { Link } from "@tanstack/react-router";
import { ChipList, Icon, type IconName } from "#/design-system/ui";

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
				<ChipList items={pr.tech} label="Stack" />
			</div>
		</Link>
	);
}

type BlogCardData = {
	slug: string;
	title: string;
	excerpt: string;
	tags: string[];
	minutes: number;
};

export function BlogCard({ post: p }: { post: BlogCardData }) {
	const [category] = p.tags;
	return (
		<Link className="blog-card" to="/blog/$slug" params={{ slug: p.slug }}>
			<span className="blog-card__pill">
				{category ? `${category} · ${p.minutes} min` : `${p.minutes} min`}
			</span>
			<h3 className="blog-card__title">{p.title}</h3>
			{p.excerpt && <p className="blog-card__desc">{p.excerpt}</p>}
		</Link>
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
