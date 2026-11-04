import { createFileRoute } from "@tanstack/react-router";
import { PostList } from "#/components/cards";
import { EmptyState } from "#/design-system/ui";
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

export const Route = createFileRoute("/_site/blog/")({
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
			<main id="main" className="site">
				<section className="site-section">
					<header className="page-head" style={{ paddingTop: 24 }}>
						<h1>Writing</h1>
						<p>{DESCRIPTION}</p>
					</header>
					{posts.length === 0 ? (
						<EmptyState
							icon="search"
							title="No posts yet"
							description="Check back soon."
						/>
					) : (
						<PostList posts={posts} />
					)}
				</section>
			</main>
		</>
	);
}
