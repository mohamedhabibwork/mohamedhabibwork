import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { asc, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { withDb } from "#/db";
import {
	blogPosts,
	experiences,
	messages,
	profile,
	projects,
	services,
	skills,
} from "#/db/schema";
import {
	experienceSchema,
	projectSchema,
	serviceSchema,
	skillSchema,
} from "#/server/fn/admin";

const json = (data: unknown) => ({
	content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
});
const notFound = (what: string) => ({
	...json({ error: `No ${what}` }),
	isError: true,
});

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const blogSchema = z.object({
	slug: z.string().trim().min(2).max(120).regex(SLUG, "lowercase-with-dashes"),
	title: z.string().trim().min(1).max(200),
	excerpt: z.string().trim().max(500).default(""),
	/** Paragraphs separated by blank lines. */
	body: z.string().trim().max(50000).default(""),
	tags: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
	coverUrl: z.string().trim().max(500).default(""),
	published: z.boolean().default(false),
});

/**
 * Portfolio MCP server. Public tools read published content; `owner` unlocks
 * drafts, the inbox and write tools (granted by a valid MCP_TOKEN bearer).
 */
export function createPortfolioMcp({ owner }: { owner: boolean }): McpServer {
	const server = new McpServer({
		name: "mohamed-habib-portfolio",
		version: "1.1.0",
	});

	server.registerTool(
		"get_profile",
		{
			title: "Get profile",
			description:
				"Mohamed Habib's profile: headline, summary, contact links, stats.",
		},
		async () => json(await withDb((db) => db.query.profile.findFirst())),
	);

	server.registerTool(
		"list_projects",
		{
			title: "List projects",
			description:
				"Published portfolio projects (summary, tech, category, year, slug).",
		},
		async () =>
			json(
				await withDb((db) =>
					db
						.select()
						.from(projects)
						.where(eq(projects.published, true))
						.orderBy(desc(projects.featured), asc(projects.sort)),
				),
			),
	);

	server.registerTool(
		"get_project",
		{
			title: "Get project",
			description: "Full case study for one project by slug.",
			inputSchema: { slug: z.string().min(1).max(120) },
		},
		async ({ slug }) => {
			const row = await withDb((db) =>
				db.query.projects.findFirst({ where: eq(projects.slug, slug) }),
			);
			if (!row || (!row.published && !owner))
				return notFound(`project '${slug}'`);
			return json(row);
		},
	);

	server.registerTool(
		"list_experience",
		{ title: "List experience", description: "Work history, newest first." },
		async () =>
			json(
				await withDb((db) =>
					db.select().from(experiences).orderBy(asc(experiences.sort)),
				),
			),
	);

	server.registerTool(
		"list_skills",
		{
			title: "List skills",
			description: "Skills grouped by category with level (1–5) and years.",
		},
		async () =>
			json(
				await withDb((db) =>
					db.select().from(skills).orderBy(asc(skills.sort)),
				),
			),
	);

	server.registerTool(
		"list_services",
		{
			title: "List services",
			description: "Services offered, with deliverables and tech.",
		},
		async () =>
			json(
				await withDb((db) =>
					db
						.select()
						.from(services)
						.where(eq(services.published, true))
						.orderBy(asc(services.sort)),
				),
			),
	);

	server.registerTool(
		"get_service",
		{
			title: "Get service",
			description:
				"Full service page (long-form description, deliverables, tech) by slug.",
			inputSchema: { slug: z.string().min(1).max(120) },
		},
		async ({ slug }) => {
			const row = await withDb((db) =>
				db.query.services.findFirst({ where: eq(services.slug, slug) }),
			);
			if (!row || (!row.published && !owner))
				return notFound(`service '${slug}'`);
			return json(row);
		},
	);

	server.registerTool(
		"list_blog_posts",
		{
			title: "List blog posts",
			description:
				"Published blog posts, newest first (no body; use get_blog_post for the full text).",
			inputSchema: { limit: z.number().int().min(1).max(100).default(20) },
		},
		async ({ limit }) =>
			json(
				await withDb((db) =>
					db
						.select({
							slug: blogPosts.slug,
							title: blogPosts.title,
							excerpt: blogPosts.excerpt,
							tags: blogPosts.tags,
							coverUrl: blogPosts.coverUrl,
							publishedAt: blogPosts.publishedAt,
						})
						.from(blogPosts)
						.where(eq(blogPosts.published, true))
						.orderBy(desc(blogPosts.publishedAt))
						.limit(limit),
				),
			),
	);

	server.registerTool(
		"get_blog_post",
		{
			title: "Get blog post",
			description: "Full blog post by slug.",
			inputSchema: { slug: z.string().min(1).max(120) },
		},
		async ({ slug }) => {
			const row = await withDb((db) =>
				db.query.blogPosts.findFirst({ where: eq(blogPosts.slug, slug) }),
			);
			if (!row || (!row.published && !owner))
				return notFound(`blog post '${slug}'`);
			return json(row);
		},
	);

	if (!owner) return server;

	server.registerTool(
		"list_messages",
		{
			title: "List contact messages",
			description: "Contact-form messages, newest first.",
			inputSchema: {
				unreadOnly: z.boolean().default(false),
				limit: z.number().int().min(1).max(100).default(20),
			},
		},
		async ({ unreadOnly, limit }) =>
			json(
				await withDb((db) =>
					db
						.select()
						.from(messages)
						.where(unreadOnly ? eq(messages.read, false) : undefined)
						.orderBy(desc(messages.createdAt))
						.limit(limit),
				),
			),
	);

	server.registerTool(
		"mark_message_read",
		{
			title: "Mark message read",
			description: "Sets a contact message's read flag.",
			inputSchema: {
				id: z.number().int().positive(),
				read: z.boolean().default(true),
			},
		},
		async ({ id, read }) => {
			const [row] = await withDb((db) =>
				db
					.update(messages)
					.set({ read })
					.where(eq(messages.id, id))
					.returning(),
			);
			return row ? json(row) : notFound(`message ${id}`);
		},
	);

	server.registerTool(
		"list_all_blog_posts",
		{
			title: "List all blog posts",
			description: "Every blog post including drafts, newest first.",
			inputSchema: { limit: z.number().int().min(1).max(100).default(50) },
		},
		async ({ limit }) =>
			json(
				await withDb((db) =>
					db
						.select()
						.from(blogPosts)
						.orderBy(desc(blogPosts.createdAt))
						.limit(limit),
				),
			),
	);

	server.registerTool(
		"upsert_blog_post",
		{
			title: "Create or update blog post",
			description:
				"Creates a blog post, or updates the one with the same slug. publishedAt is set the first time it is published.",
			inputSchema: blogSchema.shape,
		},
		async (input) => {
			const values = blogSchema.parse(input);
			const existing = await withDb((db) =>
				db.query.blogPosts.findFirst({
					where: eq(blogPosts.slug, values.slug),
				}),
			);
			const publishedAt =
				existing?.publishedAt ?? (values.published ? new Date() : null);
			const [row] = await withDb((db) =>
				db
					.insert(blogPosts)
					.values({ ...values, publishedAt })
					.onConflictDoUpdate({
						target: blogPosts.slug,
						set: { ...values, publishedAt, updatedAt: new Date() },
					})
					.returning(),
			);
			return json(row);
		},
	);

	server.registerTool(
		"delete_blog_post",
		{
			title: "Delete blog post",
			description: "Permanently deletes a blog post by slug.",
			inputSchema: { slug: z.string().min(1).max(120) },
		},
		async ({ slug }) => {
			const [row] = await withDb((db) =>
				db
					.delete(blogPosts)
					.where(eq(blogPosts.slug, slug))
					.returning({ slug: blogPosts.slug }),
			);
			return row
				? json({ deleted: row.slug })
				: notFound(`blog post '${slug}'`);
		},
	);

	server.registerTool(
		"upsert_project",
		{
			title: "Create or update project",
			description: "Creates a project, or updates the one with the same slug.",
			inputSchema: projectSchema.omit({ id: true }).shape,
		},
		async (input) => {
			const values = projectSchema.omit({ id: true }).parse(input);
			const [row] = await withDb((db) =>
				db
					.insert(projects)
					.values(values)
					.onConflictDoUpdate({ target: projects.slug, set: values })
					.returning(),
			);
			return json(row);
		},
	);

	server.registerTool(
		"upsert_service",
		{
			title: "Create or update service",
			description: "Creates a service, or updates the one with the same slug.",
			inputSchema: serviceSchema.omit({ id: true }).shape,
		},
		async (input) => {
			const values = serviceSchema.omit({ id: true }).parse(input);
			const [row] = await withDb((db) =>
				db
					.insert(services)
					.values(values)
					.onConflictDoUpdate({ target: services.slug, set: values })
					.returning(),
			);
			return json(row);
		},
	);

	server.registerTool(
		"upsert_experience",
		{
			title: "Create or update experience",
			description:
				"Creates a work-history entry, or updates it when `id` is given.",
			inputSchema: experienceSchema.shape,
		},
		async (input) => {
			const { id, ...values } = experienceSchema.parse(input);
			const [row] = await withDb((db) =>
				id
					? db
							.update(experiences)
							.set(values)
							.where(eq(experiences.id, id))
							.returning()
					: db.insert(experiences).values(values).returning(),
			);
			return row ? json(row) : notFound(`experience ${id}`);
		},
	);

	server.registerTool(
		"upsert_skill",
		{
			title: "Create or update skill",
			description: "Creates a skill, or updates it when `id` is given.",
			inputSchema: skillSchema.shape,
		},
		async (input) => {
			const { id, ...values } = skillSchema.parse(input);
			const [row] = await withDb((db) =>
				id
					? db.update(skills).set(values).where(eq(skills.id, id)).returning()
					: db.insert(skills).values(values).returning(),
			);
			return row ? json(row) : notFound(`skill ${id}`);
		},
	);

	server.registerTool(
		"update_profile",
		{
			title: "Update profile",
			description:
				"Updates profile text fields. Omitted fields stay unchanged.",
			inputSchema: {
				headline: z.string().trim().max(160).optional(),
				tagline: z.string().trim().max(300).optional(),
				summary: z.string().trim().max(3000).optional(),
				availability: z.string().trim().max(200).optional(),
				location: z.string().trim().max(160).optional(),
			},
		},
		async (patch) => {
			const set = Object.fromEntries(
				Object.entries(patch).filter(([, v]) => v !== undefined),
			);
			if (Object.keys(set).length === 0)
				return { ...json({ error: "Nothing to update" }), isError: true };
			const [row] = await withDb((db) =>
				db.update(profile).set(set).where(eq(profile.id, 1)).returning(),
			);
			return json(row);
		},
	);

	return server;
}
