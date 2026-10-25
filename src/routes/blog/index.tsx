import { createFileRoute } from "@tanstack/react-router";
import { BlogCard } from "#/components/cards";
import { SiteFooter, SiteHeader } from "#/components/site";
import { EmptyState, SectionHeading } from "#/design-system/ui";
import {
	absoluteUrl,
	breadcrumbs,
	jsonLd,
	PERSON_ID,
	pageTitle,
	seo,
} from "#/lib/seo";
import { getBlogPosts } from "#/server/fn/public";

const DESCRIPTION =
	"Notes on software engineering, self-hosting, cloud infrastructure and the tools I use day to day.";

export const Route = createFileRoute("/blog/")({
	loader: () => getBlogPosts(),
	head: ({ loaderData }) => {
		const posts = loaderData ?? [];
		const base = seo({
			title: pageTitle("Blog"),
			description: DESCRIPTION,
			path: "/blog",
		});
		const blog = {
			"@context": "https://schema.org",
			"@type": "Blog",
			name: "Mohamed Habib — Blog",
			url: absoluteUrl("/blog"),
			author: { "@id": PERSON_ID },
			blogPost: posts.map((p) => ({
				"@type": "BlogPosting",
				headline: p.title,
				url: absoluteUrl(`/blog/${p.slug}`),
				datePublished: p.publishedAt
					? new Date(p.publishedAt).toISOString()
					: undefined,
			})),
		};
		return {
			...base,
			scripts: [jsonLd(blog), jsonLd(breadcrumbs(["Blog", "/blog"]))],
		};
	},
	component: BlogIndexPage,
});

function BlogIndexPage() {
	const posts = Route.useLoaderData();
	return (
		<>
			<SiteHeader />
			<main id="main" className="site">
				<section className="site-section">
					<SectionHeading
						as="h1"
						eyebrow="Writing"
						title="Blog"
						description={DESCRIPTION}
					/>
					{posts.length === 0 ? (
						<EmptyState
							icon="search"
							title="No posts yet"
							description="Check back soon."
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
			<SiteFooter />
		</>
	);
}
