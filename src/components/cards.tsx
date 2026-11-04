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

/** Projects as an index: one row per platform, cover revealed on hover/focus. */
type WorkRowData = Pick<ProjectCardData, "slug" | "title" | "category" | "summary"> & Partial<Pick<ProjectCardData, "year" | "tech" | "imageUrl">>;

export function WorkIndex({ projects }: { projects: WorkRowData[] }) {
	return (
		<ol className="work-index">
			{projects.map((pr) => (
				<li key={pr.slug}>
					<Link className="work-row" to="/projects/$slug" params={{ slug: pr.slug }}>
						<span className="work-row__year">{pr.year}</span>
						<span className="work-row__main">
							<span className="work-row__title">{pr.title}</span>
							<span className="work-row__summary">{pr.summary}</span>
						</span>
						<span className="work-row__stack">{pr.tech?.slice(0, 3).join(", ")}</span>
						<span className="work-row__category">{pr.category}</span>
						<img className="work-row__cover" src={projectCover({ slug: pr.slug, imageUrl: pr.imageUrl ?? "" })} alt="" loading="lazy" decoding="async" width={1200} height={630} />
					</Link>
				</li>
			))}
		</ol>
	);
}

/** Services as a priced list: what it is on the left, what it costs on the right. */
export function OfferList({ services }: { services: ServiceCardData[] }) {
	return (
		<ul className="offer-list">
			{services.map((s) => (
				<li key={s.slug}>
					<Link className="offer-row" to="/services/$slug" params={{ slug: s.slug }}>
						<Icon name={s.icon as IconName} size={22} />
						<span className="offer-row__title">{s.title}</span>
						<span className="offer-row__summary">{s.summary}</span>
						<span className="offer-row__price">{s.startingAt || "Ask for a quote"}</span>
					</Link>
				</li>
			))}
		</ul>
	);
}

/** Blog posts as a reading list. */
export function PostList({ posts }: { posts: BlogCardData[] }) {
	return (
		<ul className="post-list">
			{posts.map((p) => {
				const dir = textDirection(p.title, p.excerpt);
				return (
					<li key={p.slug}>
						<Link className="post-row" to="/blog/$slug" params={{ slug: p.slug }}>
							<span className="post-row__meta">{p.minutes} min read{p.tags[0] ? `, ${p.tags[0]}` : ""}</span>
							<span className="post-row__title" dir={dir}>{p.title}</span>
							{p.excerpt && <span className="post-row__excerpt" dir={dir}>{p.excerpt}</span>}
						</Link>
					</li>
				);
			})}
		</ul>
	);
}
