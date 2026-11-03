import { createFileRoute } from "@tanstack/react-router";
import { BlogCard } from "#/components/cards";
import { EmptyState, SectionHeading } from "#/design-system/ui";
import { dominantPostLocale, postLocale } from "#/lib/blog";
import {
	breadcrumbs,
	jsonLd,
	localizedUrl,
	PERSON_ID,
	pageTitle,
	seo,
} from "#/lib/seo";
import { getBlogPosts } from "#/server/fn/public";
import { m } from "#/paraglide/messages";

export const Route = createFileRoute("/_site/blog/")({
	loader: () => getBlogPosts(),
	head: ({ loaderData }) => {
		const posts = loaderData ?? [];
		const contentLocale = dominantPostLocale(posts);
		// The index lists the same posts under both prefixes, so its metadata follows the language they're written in.
		const locale = contentLocale;
		const title = m.blog_seo_title({}, { locale });
		const description = m.blog_seo_description({}, { locale });
		const url = localizedUrl("/blog", contentLocale);
		const base = seo({
			title: pageTitle(title),
			description,
			path: "/blog",
			contentLocale,
		});
		const blog = {
			"@context": "https://schema.org",
			"@type": "Blog",
			name: "Mohamed Habib — Blog",
			url,
			inLanguage: contentLocale,
			author: { "@id": PERSON_ID },
			blogPost: posts.map((p) => ({
				"@type": "BlogPosting",
				headline: p.title,
				url: localizedUrl(`/blog/${p.slug}`, postLocale(p)),
				datePublished: p.publishedAt
					? new Date(p.publishedAt).toISOString()
					: undefined,
			})),
		};
		return {
			...base,
			scripts: [jsonLd(blog), jsonLd(breadcrumbs(locale, [m.nav_blog({}, { locale }), "/blog"]))],
		};
	},
	component: BlogIndexPage,
});

function BlogIndexPage() {
	const posts = Route.useLoaderData();
	return (
		<>
			<main id="main" className="site">
				<section className="site-section">
					<SectionHeading
						as="h1"
						eyebrow={m.blog_eyebrow()}
						title={m.nav_blog()}
						description={m.blog_seo_description()}
					/>
					{posts.length === 0 ? (
						<EmptyState
							icon="search"
							title={m.blog_empty_title()}
							description={m.blog_empty_body()}
						/>
					) : (
						<div className="blog-related__grid">
							{posts.map((p) => (
								<BlogCard key={p.slug} post={p} />
							))}
						</div>
					)}
				</section>
			</main>
		</>
	);
}
