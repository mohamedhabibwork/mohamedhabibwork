import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { and, asc, desc, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { withDb } from "#/db";
import { notifyOwnerOfMessage } from "#/server/mail";
import { verifyTurnstile } from "#/server/turnstile";
import { cvs, experiences, messages, projects, services, skills } from "#/db/schema";

/** Everything the public portfolio page renders, in one round trip. */
export const getPortfolio = createServerFn({ method: "GET" }).handler(async () =>
	withDb(async (db) => {
		const [p, exp, proj, sk, publicCvs, svc] = await Promise.all([
			db.query.profile.findFirst(),
			db.select().from(experiences).orderBy(asc(experiences.sort), desc(experiences.start)),
			db.select().from(projects).where(eq(projects.published, true)).orderBy(desc(projects.featured), asc(projects.sort)),
			db.select().from(skills).orderBy(asc(skills.sort), desc(skills.level)),
			db.select({ slug: cvs.slug, title: cvs.title }).from(cvs).where(eq(cvs.isPublic, true)).orderBy(desc(cvs.updatedAt)),
			db.select({ slug: services.slug, title: services.title, icon: services.icon, summary: services.summary, startingAt: services.startingAt }).from(services).where(eq(services.published, true)).orderBy(asc(services.sort)),
		]);
		return { profile: p ?? null, experiences: exp, projects: proj, skills: sk, publicCvs, services: svc };
	}),
);

/** All published projects for /projects. */
export const getProjects = createServerFn({ method: "GET" }).handler(async () =>
	withDb((db) => db.select().from(projects).where(eq(projects.published, true)).orderBy(desc(projects.featured), asc(projects.sort))),
);

/** All published services for /services. */
export const getServices = createServerFn({ method: "GET" }).handler(async () =>
	withDb((db) => db.select().from(services).where(eq(services.published, true)).orderBy(asc(services.sort))),
);

/** One published service plus the others for cross-links. Returns null when missing. */
export const getService = createServerFn({ method: "GET" })
	.validator((slug: unknown) => z.string().trim().min(1).max(120).parse(slug))
	.handler(async ({ data: slug }) =>
		withDb(async (db) => {
			const service = await db.query.services.findFirst({ where: and(eq(services.slug, slug), eq(services.published, true)) });
			if (!service) return null;
			const others = await db
				.select({ slug: services.slug, title: services.title, icon: services.icon, summary: services.summary })
				.from(services)
				.where(and(eq(services.published, true), ne(services.id, service.id)))
				.orderBy(asc(services.sort));
			const owner = await db.query.profile.findFirst({ columns: { name: true, email: true, phone: true } });
			return { service, others, owner: owner ?? null };
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
	service: z.string().trim().max(120).regex(/^[a-z0-9-]*$/).default(""),
	body: z.string().trim().min(10, "Tell me a little more (10+ characters)").max(5000),
	"cf-turnstile-response": z.string().max(2048).default(""),
	/** Honeypot: real visitors leave it empty. */
	company: z.string().max(0).optional(),
});

export const sendMessage = createServerFn({ method: "POST" })
	.validator((input: unknown) => contactSchema.parse(input))
	.handler(async ({ data }) => {
		if (!(await verifyTurnstile(data["cf-turnstile-response"], "contact", getRequestHeader("cf-connecting-ip")))) {
			return { ok: false as const, error: "Please complete the verification and try again." };
		}
		const msg = { name: data.name, email: data.email, subject: data.subject, service: data.service, body: data.body };
		// Only keep a service tag that matches a real published service.
		const serviceTitle = await withDb(async (db) => {
			const svc = msg.service ? await db.query.services.findFirst({ where: and(eq(services.slug, msg.service), eq(services.published, true)) }) : undefined;
			await db.insert(messages).values({ ...msg, service: svc ? msg.service : "" });
			return svc?.title ?? "";
		});
		await notifyOwnerOfMessage({ ...msg, serviceTitle });
		return { ok: true as const };
	});
