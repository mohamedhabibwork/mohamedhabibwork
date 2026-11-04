import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import Markdown from "react-markdown";
import { BlogCard } from "#/components/cards";
import { ChipList, EmptyState, Icon, LinkButton } from "#/design-system/ui";
import {
	postAlternates,
	postHref,
	postLocale,
	readingMinutes,
	textDirection,
} from "#/lib/blog";
import { RSS_PATH, RSS_TITLE } from "#/lib/feed";
import {
	absoluteUrl,
	AUTHOR,
	breadcrumbs,
	DEFAULT_OG_IMAGE,
	jsonLd,
	localizedUrl,
	pageTitle,
	seo,
	truncate,
} from "#/lib/seo";
import { getBlogPost } from "#/server/fn/public";
import { m } from "#/paraglide/messages";
import { getLocale, localizeHref } from "#/paraglide/runtime";

export const Route = createFileRoute("/_site/blog/$slug")({
	loader: async ({ params, location }) => {
		const data = await getBlogPost({ data: params.slug });
		if (!data) throw notFound();
		// A post lives at one URL, in the language it's written in.
		const locale = postLocale(data.post);
		if (locale !== getLocale())
			throw redirect({
				href: `${postHref({ slug: data.post.slug, locale })}${location.searchStr}`,
				statusCode: 301,
			});
		return data;
	},
	head: ({ loaderData, params }) => {
		if (!loaderData)
			return seo({
				title: pageTitle(m.blog_not_found_title()),
				description: m.blog_not_found_seo(),
				path: `/blog/${params.slug}`,
				noindex: true,
			});
		const { post, translation } = loaderData;
		const path = `/blog/${post.slug}`;
		const description = truncate(post.excerpt || post.body);
		const contentLocale = postLocale(post);
		const [section] = post.tags;
		const publishedTime = post.publishedAt
			? new Date(post.publishedAt).toISOString()
			: undefined;
		const modifiedTime = new Date(post.updatedAt).toISOString();
		const image = post.coverUrl
			? { url: post.coverUrl, alt: post.title }
			: DEFAULT_OG_IMAGE;
		const url = localizedUrl(path, contentLocale);
		const base = seo({
			title: pageTitle(post.title),
			description,
			path,
			type: "article",
			image,
			contentLocale,
			alternates: postAlternates(post, translation?.slug),
			article: { publishedTime, modifiedTime, section },
		});
		const article = {
			"@context": "https://schema.org",
			"@type": "BlogPosting",
			headline: post.title,
			description,
			inLanguage: contentLocale,
			url,
			mainEntityOfPage: url,
			image: [absoluteUrl(image.url)],
			datePublished: publishedTime,
			dateModified: modifiedTime,
			articleSection: section,
			keywords: post.tags.join(", ") || undefined,
			wordCount: post.body.trim().split(/\s+/).filter(Boolean).length,
			author: AUTHOR,
			publisher: AUTHOR,
		};
		return {
			...base,
			links: [
				...base.links,
				{
					rel: "alternate",
					type: "application/rss+xml",
					title: RSS_TITLE,
					href: RSS_PATH,
				},
			],
			scripts: [
				jsonLd(article),
				jsonLd(
					breadcrumbs(
						contentLocale,
						[m.nav_blog({}, { locale: contentLocale }), "/blog"],
						[post.title, path],
					),
				),
			],
		};
	},
	notFoundComponent: () => (
		<main id="main" className="site" style={{ padding: "96px 0" }}>
			<EmptyState
				icon="search"
				title={m.blog_not_found_title()}
				description={m.blog_not_found_body()}
				action={<LinkButton href={localizeHref("/")}>{m.not_found_home()}</LinkButton>}
			/>
		</main>
	),
	component: BlogPostPage,
});

function BlogPostPage() {
	const { post, related } = Route.useLoaderData();
	const [category] = post.tags;
	const minutes = readingMinutes(post.body);
	const dir = textDirection(post.title, post.excerpt, post.body);
	const published = post.publishedAt
		? new Date(post.publishedAt).toLocaleDateString(getLocale() === "ar" ? "ar-EG" : "en-GB", {
				day: "numeric",
				month: "short",
				year: "numeric",
				timeZone: "UTC",
			})
		: null;
	return (
		<>
			<main id="main" className="site">
				<article
					className="blog-post site-section"
					aria-labelledby="post-title"
					dir={dir}
					lang={dir === "rtl" ? "ar" : "en"}
				>
					<nav className="blog-post__crumbs" aria-label={m.blog_breadcrumb()}>
						<Link to="/">{m.nav_home()}</Link>
						<span aria-hidden>/</span>
						<Link to="/blog">{m.nav_blog()}</Link>
						{category && (
							<>
								<span aria-hidden>/</span>
								<span>{category}</span>
							</>
						)}
					</nav>
					<h1 className="blog-post__title" id="post-title">
						{post.title}
					</h1>
					{post.excerpt && <p className="blog-post__lead">{post.excerpt}</p>}
					<p className="blog-post__byline">
						<strong>Mohamed Habib</strong>
						{published && <> · {published}</>} · {m.blog_min_read({ count: minutes })}
					</p>
					<div className="blog-post__body">
						<Markdown>{post.body}</Markdown>
					</div>
					{post.tags.length > 0 && <ChipList items={post.tags} label={m.blog_tags()} />}
				</article>

				{related.length > 0 && (
					<section className="site-section" aria-labelledby="related-title">
						<h2 className="blog-related__title" id="related-title">
							{m.blog_related()}
						</h2>
						<div className="blog-related__grid">
							{related.map((p) => (
								<BlogCard key={p.slug} post={p} />
							))}
							<Link className="blog-cta" to="/services">
								<span className="blog-cta__eyebrow">{m.nav_services()}</span>
								<span className="blog-cta__title">
									{m.blog_cta()} <Icon name="arrow-right" size={16} />
								</span>
							</Link>
						</div>
					</section>
				)}
			</main>
		</>
	);
}
