import { createFileRoute } from "@tanstack/react-router";
import { PostList } from "#/components/cards";
import { EmptyState, SectionHeading } from "#/design-system/ui";
import { dominantPostLocale } from "#/lib/blog";
import { RSS_PATH, RSS_TITLE } from "#/lib/feed";
import {
	AUTHOR,
	breadcrumbs,
	jsonLd,
	localizedUrl,
	pageTitle,
	seo,
} from "#/lib/seo";
import { m } from "#/paraglide/messages";
import { getLocale } from "#/paraglide/runtime";
import { getBlogPosts } from "#/server/fn/public";

export const Route = createFileRoute("/_site/blog/")({
	loader: () => getBlogPosts(),
	head: ({ loaderData }) => {
		const posts = loaderData ?? [];
		const contentLocale = dominantPostLocale(posts.map((p) => p.locale));
		// The index lists the same posts under both prefixes, so its canonical follows the language
		// they're written in, while the title and description match the language the page is showing.
		const locale = contentLocale;
		const title = m.blog_seo_title({}, { locale: getLocale() });
		const description = m.blog_seo_description({}, { locale: getLocale() });
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
			author: AUTHOR,
			blogPost: posts.map((p) => ({
				"@type": "BlogPosting",
				headline: p.title,
				url: localizedUrl(`/blog/${p.slug}`, p.locale),
				datePublished: p.publishedAt
					? new Date(p.publishedAt).toISOString()
					: undefined,
			})),
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
				jsonLd(blog),
				jsonLd(breadcrumbs(locale, [m.nav_blog({}, { locale }), "/blog"])),
			],
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
						<PostList posts={posts} />
					)}
				</section>
			</main>
		</>
	);
}
