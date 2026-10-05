import { createServerFn } from "@tanstack/react-start";
import { and, asc, desc, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { withDb } from "#/db";
import { notifyOwnerOfMessage } from "#/server/mail";
import { cvs, experiences, messages, projects, skills } from "#/db/schema";

/** Everything the public portfolio page renders, in one round trip. */
export const getPortfolio = createServerFn({ method: "GET" }).handler(async () =>
	withDb(async (db) => {
		const [p, exp, proj, sk, publicCvs] = await Promise.all([
			db.query.profile.findFirst(),
			db.select().from(experiences).orderBy(asc(experiences.sort), desc(experiences.start)),
			db.select().from(projects).where(eq(projects.published, true)).orderBy(desc(projects.featured), asc(projects.sort)),
			db.select().from(skills).orderBy(asc(skills.sort), desc(skills.level)),
			db.select({ slug: cvs.slug, title: cvs.title }).from(cvs).where(eq(cvs.isPublic, true)).orderBy(desc(cvs.updatedAt)),
		]);
		return { profile: p ?? null, experiences: exp, projects: proj, skills: sk, publicCvs };
	}),
);

/** One published project plus a few related ones for /projects/$slug. Returns null when missing. */
export const getProject = createServerFn({ method: "GET" })
	.validator((slug: unknown) => z.string().trim().min(1).max(120).parse(slug))
	.handler(async ({ data: slug }) =>
		withDb(async (db) => {
			const project = await db.query.projects.findFirst({ where: and(eq(projects.slug, slug), eq(projects.published, true)) });
			if (!project) return null;
			const [profile, related] = await Promise.all([
				db.query.profile.findFirst(),
				db
					.select({ slug: projects.slug, title: projects.title, subtitle: projects.subtitle, category: projects.category })
					.from(projects)
					.where(and(eq(projects.published, true), ne(projects.id, project.id)))
					.orderBy(desc(projects.featured), asc(projects.sort))
					.limit(3),
			]);
			return { project, related, owner: profile ? { name: profile.name, github: profile.github, linkedin: profile.linkedin } : null };
		}),
	);

const contactSchema = z.object({
	name: z.string().trim().min(2, "Enter your name").max(120),
	email: z.string().trim().email("Enter a valid email").max(200),
	subject: z.string().trim().max(200).default(""),
	body: z.string().trim().min(10, "Tell me a little more (10+ characters)").max(5000),
	/** Honeypot: real visitors leave it empty. */
	company: z.string().max(0).optional(),
});

export const sendMessage = createServerFn({ method: "POST" })
	.validator((input: unknown) => contactSchema.parse(input))
	.handler(async ({ data }) => {
		const msg = { name: data.name, email: data.email, subject: data.subject, body: data.body };
		await withDb((db) => db.insert(messages).values(msg));
		await notifyOwnerOfMessage(msg);
		return { ok: true as const };
	});
