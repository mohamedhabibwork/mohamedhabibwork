import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { asc, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { withDb } from "#/db";
import { experiences, messages, profile, projects, services, skills } from "#/db/schema";
import { projectSchema } from "#/server/fn/admin";

const json = (data: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] });

/**
 * Portfolio MCP server. Public tools read published content; `owner` unlocks
 * the inbox and write tools (granted by a valid MCP_TOKEN bearer).
 */
export function createPortfolioMcp({ owner }: { owner: boolean }): McpServer {
	const server = new McpServer({ name: "mohamed-habib-portfolio", version: "1.0.0" });

	server.registerTool("get_profile", { title: "Get profile", description: "Mohamed Habib's profile: headline, summary, contact links, stats." }, async () =>
		json(await withDb((db) => db.query.profile.findFirst())),
	);

	server.registerTool("list_projects", { title: "List projects", description: "Published portfolio projects (summary, tech, category, year, slug)." }, async () =>
		json(await withDb((db) => db.select().from(projects).where(eq(projects.published, true)).orderBy(desc(projects.featured), asc(projects.sort)))),
	);

	server.registerTool(
		"get_project",
		{ title: "Get project", description: "Full case study for one project by slug.", inputSchema: { slug: z.string().min(1).max(120) } },
		async ({ slug }) => {
			const row = await withDb((db) => db.query.projects.findFirst({ where: eq(projects.slug, slug) }));
			if (!row || (!row.published && !owner)) return { ...json({ error: `No project '${slug}'` }), isError: true };
			return json(row);
		},
	);

	server.registerTool("list_experience", { title: "List experience", description: "Work history, newest first." }, async () =>
		json(await withDb((db) => db.select().from(experiences).orderBy(asc(experiences.sort)))),
	);

	server.registerTool("list_skills", { title: "List skills", description: "Skills grouped by category with level (1–5) and years." }, async () =>
		json(await withDb((db) => db.select().from(skills).orderBy(asc(skills.sort)))),
	);

	server.registerTool("list_services", { title: "List services", description: "Services offered, with deliverables and tech." }, async () =>
		json(await withDb((db) => db.select().from(services).where(eq(services.published, true)).orderBy(asc(services.sort)))),
	);

	if (!owner) return server;

	server.registerTool(
		"list_messages",
		{ title: "List contact messages", description: "Contact-form messages, newest first.", inputSchema: { unreadOnly: z.boolean().default(false), limit: z.number().int().min(1).max(100).default(20) } },
		async ({ unreadOnly, limit }) =>
			json(
				await withDb((db) =>
					db.select().from(messages).where(unreadOnly ? eq(messages.read, false) : undefined).orderBy(desc(messages.createdAt)).limit(limit),
				),
			),
	);

	server.registerTool(
		"upsert_project",
		{ title: "Create or update project", description: "Creates a project, or updates the one with the same slug.", inputSchema: projectSchema.omit({ id: true }).shape },
		async (input) => {
			const values = projectSchema.omit({ id: true }).parse(input);
			const [row] = await withDb((db) =>
				db.insert(projects).values(values).onConflictDoUpdate({ target: projects.slug, set: values }).returning(),
			);
			return json(row);
		},
	);

	server.registerTool(
		"update_profile",
		{
			title: "Update profile",
			description: "Updates profile text fields. Omitted fields stay unchanged.",
			inputSchema: {
				headline: z.string().trim().max(160).optional(),
				tagline: z.string().trim().max(300).optional(),
				summary: z.string().trim().max(3000).optional(),
				availability: z.string().trim().max(200).optional(),
				location: z.string().trim().max(160).optional(),
			},
		},
		async (patch) => {
			const set = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined));
			if (Object.keys(set).length === 0) return { ...json({ error: "Nothing to update" }), isError: true };
			const [row] = await withDb((db) => db.update(profile).set(set).where(eq(profile.id, 1)).returning());
			return json(row);
		},
	);

	return server;
}
