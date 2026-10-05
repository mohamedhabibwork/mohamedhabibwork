import { createServerFn } from "@tanstack/react-start";
import { asc, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { type Db, withDb } from "#/db";
import { atsReports, cvs, experiences, projects, skills } from "#/db/schema";
import { analyzeCv } from "#/server/ats";
import { requireOwner } from "#/server/auth";
import { type CvData, cvDataSchema, cvMetaSchema } from "#/server/cv-schema";

/** Builds a CV document from the portfolio content, so every new CV starts complete. */
export async function cvFromPortfolio(db: Db): Promise<CvData> {
	const [p, exp, proj, sk] = await Promise.all([
		db.query.profile.findFirst(),
		db.select().from(experiences).orderBy(asc(experiences.sort)),
		db.select().from(projects).where(eq(projects.published, true)).orderBy(desc(projects.featured), asc(projects.sort)),
		db.select().from(skills).orderBy(asc(skills.sort)),
	]);
	const groups = new Map<string, string[]>();
	for (const s of sk) groups.set(s.category, [...(groups.get(s.category) ?? []), s.name]);
	return cvDataSchema.parse({
		name: p?.name ?? "Your name",
		title: p?.headline ?? "",
		email: p?.email ?? "",
		phone: p?.phone ?? "",
		location: p?.location ?? "",
		website: p?.website ?? "",
		linkedin: p?.linkedin ?? "",
		github: p?.github ?? "",
		photoUrl: p?.photoUrl ?? "",
		summary: p?.summary ?? "",
		experience: exp.map((e) => ({ role: e.role, company: e.company, location: e.location, start: e.start, end: e.end, current: e.current, bullets: e.highlights })),
		projects: proj.filter((x) => x.featured).slice(0, 4).map((x) => ({ name: x.title, description: x.summary, tech: x.tech, url: x.url })),
		skills: [...groups.entries()].map(([name, items]) => ({ name, items })),
	});
}

export const listCvs = createServerFn({ method: "GET" }).handler(async () => {
	await requireOwner();
	return withDb((db) =>
		db.select({ id: cvs.id, title: cvs.title, slug: cvs.slug, template: cvs.template, isPublic: cvs.isPublic, updatedAt: cvs.updatedAt }).from(cvs).orderBy(desc(cvs.updatedAt)),
	);
});

export const getCv = createServerFn({ method: "GET" })
	.validator((i: unknown) => z.object({ id: z.number().int().positive() }).parse(i))
	.handler(async ({ data }) => {
		await requireOwner();
		return withDb(async (db) => {
			const cv = await db.query.cvs.findFirst({ where: eq(cvs.id, data.id) });
			if (!cv) throw new Error("NOT_FOUND");
			const reports = await db.select().from(atsReports).where(eq(atsReports.cvId, cv.id)).orderBy(desc(atsReports.createdAt)).limit(10);
			return { cv, reports };
		});
	});

async function uniqueSlug(db: Db, base: string): Promise<string> {
	const root = base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "cv";
	for (let i = 0; i < 50; i++) {
		const slug = i ? `${root}-${i + 1}` : root;
		if (!(await db.query.cvs.findFirst({ where: eq(cvs.slug, slug) }))) return slug;
	}
	return `${root}-${Date.now()}`;
}

export const createCv = createServerFn({ method: "POST" })
	.validator((i: unknown) => z.object({ title: z.string().trim().min(1).max(120), fromPortfolio: z.boolean() }).parse(i))
	.handler(async ({ data }) => {
		await requireOwner();
		return withDb(async (db) => {
			const doc = data.fromPortfolio ? await cvFromPortfolio(db) : cvDataSchema.parse({ name: "Your name" });
			const [row] = await db.insert(cvs).values({ title: data.title, slug: await uniqueSlug(db, data.title), data: doc }).returning({ id: cvs.id });
			return { id: row.id };
		});
	});

export const duplicateCv = createServerFn({ method: "POST" })
	.validator((i: unknown) => z.object({ id: z.number().int().positive() }).parse(i))
	.handler(async ({ data }) => {
		await requireOwner();
		return withDb(async (db) => {
			const src = await db.query.cvs.findFirst({ where: eq(cvs.id, data.id) });
			if (!src) throw new Error("NOT_FOUND");
			const title = `${src.title} (copy)`;
			const [row] = await db
				.insert(cvs)
				.values({ title, slug: await uniqueSlug(db, title), template: src.template, accent: src.accent, isPublic: false, data: src.data })
				.returning({ id: cvs.id });
			return { id: row.id };
		});
	});

export const saveCv = createServerFn({ method: "POST" })
	.validator((i: unknown) => z.object({ id: z.number().int().positive(), meta: cvMetaSchema, data: cvDataSchema }).parse(i))
	.handler(async ({ data }) => {
		await requireOwner();
		return withDb(async (db) => {
			const clash = await db.query.cvs.findFirst({ where: eq(cvs.slug, data.meta.slug) });
			if (clash && clash.id !== data.id) return { ok: false as const, error: "Another CV already uses that link." };
			await db.update(cvs).set({ ...data.meta, data: data.data }).where(eq(cvs.id, data.id));
			return { ok: true as const };
		});
	});

export const deleteCv = createServerFn({ method: "POST" })
	.validator((i: unknown) => z.object({ id: z.number().int().positive() }).parse(i))
	.handler(async ({ data }) => {
		await requireOwner();
		await withDb((db) => db.delete(cvs).where(eq(cvs.id, data.id)));
		return { ok: true as const };
	});

export const runAtsCheck = createServerFn({ method: "POST" })
	.validator((i: unknown) =>
		z.object({ cvId: z.number().int().positive(), jobTitle: z.string().trim().max(160), jobDescription: z.string().trim().min(30, "Paste the full job description (30+ characters)").max(20000), data: cvDataSchema }).parse(i),
	)
	.handler(async ({ data }) => {
		await requireOwner();
		const result = analyzeCv(data.data, data.jobDescription);
		await withDb((db) => db.insert(atsReports).values({ cvId: data.cvId, jobTitle: data.jobTitle, jobDescription: data.jobDescription, score: result.score, result }));
		return result;
	});
