import { createFileRoute } from "@tanstack/react-router";
import { BlogCard } from "#/components/cards";
import { EmptyState, SectionHeading } from "#/design-system/ui";
import { dominantPostLocale, postLocale } from "#/lib/blog";
import {
	breadcrumbs,
	forLocale,
	jsonLd,
	localizedUrl,
	PERSON_ID,
	pageTitle,
	seo,
} from "#/lib/seo";
import { SEO_AR } from "#/lib/seo-ar";
import { m } from "#/paraglide/messages";
import { getBlogPosts } from "#/server/fn/public";

const DESCRIPTION =
	"Notes on software engineering, self-hosting, cloud infrastructure and the tools I use day to day.";

/** The index lists the same posts under both prefixes, so its metadata follows the language they're written in. */
const META = {
	en: { title: "Software Engineering Blog", description: DESCRIPTION },
	ar: {
		title: "مدونة هندسة البرمجيات",
		description:
			"مقالات عملية عن هندسة البرمجيات والاستضافة الذاتية والبنية السحابية والأدوات اللي بستخدمها كل يوم.",
	},
};

export const Route = createFileRoute("/_site/blog/")({
	loader: () => getBlogPosts(),
	head: ({ loaderData }) => {
		const posts = loaderData ?? [];
		const contentLocale = dominantPostLocale(posts);
		const { title, description } = META[contentLocale];
		const url = localizedUrl("/blog", contentLocale);
		const base = seo({
			title: pageTitle(title),
			description,
			path: "/blog",
			languages: [contentLocale],
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
			scripts: [jsonLd(blog), jsonLd(breadcrumbs([m.nav_blog(), url]))],
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
						description={forLocale(DESCRIPTION, SEO_AR.blog.description)}
					/>
					{posts.length === 0 ? (
						<EmptyState
							icon="search"
							title={m.blog_empty()}
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
