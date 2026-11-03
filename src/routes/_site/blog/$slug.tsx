import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import Markdown from "react-markdown";
import { BlogCard } from "#/components/cards";
import { ChipList, EmptyState, Icon, LinkButton } from "#/design-system/ui";
import { postAlternates, postLocale, readingMinutes, textDirection } from "#/lib/blog";
import {
	jsonLd,
	localizedUrl,
	PERSON_ID,
	pageTitle,
	seo,
	truncate,
} from "#/lib/seo";
import { getBlogPost } from "#/server/fn/public";
import { m } from "#/paraglide/messages";
import { getLocale, localizeHref } from "#/paraglide/runtime";

export const Route = createFileRoute("/_site/blog/$slug")({
	loader: async ({ params }) => {
		const data = await getBlogPost({ data: params.slug });
		if (!data) throw notFound();
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
		const base = seo({
			title: pageTitle(post.title),
			description,
			path,
			type: "article",
			contentLocale,
			alternates: postAlternates(post, translation?.slug),
		});
		const article = {
			"@context": "https://schema.org",
			"@type": "BlogPosting",
			headline: post.title,
			description,
			inLanguage: contentLocale,
			url: localizedUrl(path, contentLocale),
			datePublished: post.publishedAt
				? new Date(post.publishedAt).toISOString()
				: undefined,
			author: { "@id": PERSON_ID },
		};
		return { ...base, scripts: [jsonLd(article)] };
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
