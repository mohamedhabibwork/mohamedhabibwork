import { createServerFn } from "@tanstack/react-start";
import { asc, count, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { withDb } from "#/db";
import { atsReports, cvs, experiences, messages, payments, profile, projects, services, skills } from "#/db/schema";
import { requireOwner } from "#/server/auth";

const list = z.array(z.string().trim().max(400)).max(30);
const id = z.object({ id: z.number().int().positive() });

export const getDashboard = createServerFn({ method: "GET" }).handler(async () => {
	await requireOwner();
	return withDb(async (db) => {
		const [[proj], [exp], [msg], [unread], [cvCount], recentMessages, recentCvs, recentAts] = await Promise.all([
			db.select({ n: count() }).from(projects),
			db.select({ n: count() }).from(experiences),
			db.select({ n: count() }).from(messages),
			db.select({ n: count() }).from(messages).where(eq(messages.read, false)),
			db.select({ n: count() }).from(cvs),
			db.select().from(messages).orderBy(desc(messages.createdAt)).limit(5),
			db.select({ id: cvs.id, title: cvs.title, slug: cvs.slug, isPublic: cvs.isPublic, updatedAt: cvs.updatedAt }).from(cvs).orderBy(desc(cvs.updatedAt)).limit(5),
			db.select({ id: atsReports.id, cvId: atsReports.cvId, jobTitle: atsReports.jobTitle, score: atsReports.score, createdAt: atsReports.createdAt }).from(atsReports).orderBy(desc(atsReports.createdAt)).limit(5),
		]);
		return { counts: { projects: proj.n, experiences: exp.n, messages: msg.n, unread: unread.n, cvs: cvCount.n }, recentMessages, recentCvs, recentAts };
	});
});

/* ── Profile ── */
const profileSchema = z.object({
	name: z.string().trim().min(1).max(120),
	headline: z.string().trim().min(1).max(160),
	tagline: z.string().trim().max(300),
	summary: z.string().trim().max(3000),
	email: z.string().trim().email(),
	phone: z.string().trim().max(40),
	location: z.string().trim().max(160),
	website: z.string().trim().max(300),
	github: z.string().trim().max(300),
	linkedin: z.string().trim().max(300),
	availability: z.string().trim().max(200),
	certifications: list.default([]),
	photoUrl: z.string().trim().max(500),
	stats: z.array(z.object({ label: z.string().trim().max(60), value: z.string().trim().max(20) })).max(8),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const getProfile = createServerFn({ method: "GET" }).handler(async () => {
	await requireOwner();
	return withDb(async (db) => (await db.query.profile.findFirst()) ?? null);
});

export const saveProfile = createServerFn({ method: "POST" })
	.validator((i: unknown) => profileSchema.parse(i))
	.handler(async ({ data }) => {
		await requireOwner();
		await withDb((db) => db.insert(profile).values({ id: 1, ...data }).onConflictDoUpdate({ target: profile.id, set: data }));
		return { ok: true as const };
	});

/* ── Experience ── */
const experienceSchema = z.object({
	id: z.number().int().positive().optional(),
	company: z.string().trim().min(1).max(160),
	role: z.string().trim().min(1).max(160),
	location: z.string().trim().max(160),
	start: z.string().trim().min(1).max(20),
	end: z.string().trim().max(20),
	current: z.boolean(),
	summary: z.string().trim().max(1500),
	highlights: list,
	tech: list,
	sort: z.number().int(),
});
export type ExperienceInput = z.infer<typeof experienceSchema>;

export const listExperiences = createServerFn({ method: "GET" }).handler(async () => {
	await requireOwner();
	return withDb((db) => db.select().from(experiences).orderBy(asc(experiences.sort)));
});
export const saveExperience = createServerFn({ method: "POST" })
	.validator((i: unknown) => experienceSchema.parse(i))
	.handler(async ({ data }) => {
		await requireOwner();
		const { id: rowId, ...values } = data;
		return withDb(async (db) => {
			if (rowId) await db.update(experiences).set(values).where(eq(experiences.id, rowId));
			else await db.insert(experiences).values(values);
			return { ok: true as const };
		});
	});
export const deleteExperience = createServerFn({ method: "POST" })
	.validator((i: unknown) => id.parse(i))
	.handler(async ({ data }) => {
		await requireOwner();
		await withDb((db) => db.delete(experiences).where(eq(experiences.id, data.id)));
		return { ok: true as const };
	});

/* ── Projects ── */
export const projectSchema = z.object({
	id: z.number().int().positive().optional(),
	slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "lowercase-with-dashes"),
	title: z.string().trim().min(1).max(160),
	subtitle: z.string().trim().max(200),
	category: z.string().trim().max(80),
	year: z.string().trim().max(20),
	summary: z.string().trim().max(1500),
	description: z.string().trim().max(10000).default(""),
	role: z.string().trim().max(300).default(""),
	challenge: z.string().trim().max(1500).default(""),
	outcomes: list.default([]),
	features: list,
	tech: list,
	url: z.string().trim().max(300),
	imageUrl: z.string().trim().max(500),
	featured: z.boolean(),
	published: z.boolean(),
	sort: z.number().int(),
});
export type ProjectInput = z.infer<typeof projectSchema>;

export const listProjects = createServerFn({ method: "GET" }).handler(async () => {
	await requireOwner();
	return withDb((db) => db.select().from(projects).orderBy(asc(projects.sort)));
});
export const saveProject = createServerFn({ method: "POST" })
	.validator((i: unknown) => projectSchema.parse(i))
	.handler(async ({ data }) => {
		await requireOwner();
		const { id: rowId, ...values } = data;
		return withDb(async (db) => {
			const clash = await db.query.projects.findFirst({ where: eq(projects.slug, values.slug) });
			if (clash && clash.id !== rowId) return { ok: false as const, error: "Another project already uses that slug." };
			if (rowId) await db.update(projects).set(values).where(eq(projects.id, rowId));
			else await db.insert(projects).values(values);
			return { ok: true as const };
		});
	});
export const deleteProject = createServerFn({ method: "POST" })
	.validator((i: unknown) => id.parse(i))
	.handler(async ({ data }) => {
		await requireOwner();
		await withDb((db) => db.delete(projects).where(eq(projects.id, data.id)));
		return { ok: true as const };
	});

/* ── Services ── */
export const serviceSchema = z.object({
	id: z.number().int().positive().optional(),
	slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "lowercase-with-dashes"),
	title: z.string().trim().min(1).max(160),
	icon: z.string().trim().max(40).default("code"),
	summary: z.string().trim().max(500),
	description: z.string().trim().max(10000).default(""),
	deliverables: list.default([]),
	tech: list.default([]),
	startingAt: z.string().trim().max(80).default(""),
	published: z.boolean(),
	sort: z.number().int(),
});
export type ServiceInput = z.infer<typeof serviceSchema>;

export const listServices = createServerFn({ method: "GET" }).handler(async () => {
	await requireOwner();
	return withDb((db) => db.select().from(services).orderBy(asc(services.sort)));
});
export const saveService = createServerFn({ method: "POST" })
	.validator((i: unknown) => serviceSchema.parse(i))
	.handler(async ({ data }) => {
		await requireOwner();
		const { id: rowId, ...values } = data;
		return withDb(async (db) => {
			const clash = await db.query.services.findFirst({ where: eq(services.slug, values.slug) });
			if (clash && clash.id !== rowId) return { ok: false as const, error: "Another service already uses that slug." };
			if (rowId) await db.update(services).set(values).where(eq(services.id, rowId));
			else await db.insert(services).values(values);
			return { ok: true as const };
		});
	});
export const deleteService = createServerFn({ method: "POST" })
	.validator((i: unknown) => id.parse(i))
	.handler(async ({ data }) => {
		await requireOwner();
		await withDb((db) => db.delete(services).where(eq(services.id, data.id)));
		return { ok: true as const };
	});

/* ── Skills ── */
const skillSchema = z.object({
	id: z.number().int().positive().optional(),
	name: z.string().trim().min(1).max(80),
	category: z.string().trim().min(1).max(80),
	level: z.number().int().min(1).max(5),
	years: z.number().int().min(0).max(60).nullable(),
	sort: z.number().int(),
});
export type SkillInput = z.infer<typeof skillSchema>;

export const listSkills = createServerFn({ method: "GET" }).handler(async () => {
	await requireOwner();
	return withDb((db) => db.select().from(skills).orderBy(asc(skills.category), asc(skills.sort)));
});
export const saveSkill = createServerFn({ method: "POST" })
	.validator((i: unknown) => skillSchema.parse(i))
	.handler(async ({ data }) => {
		await requireOwner();
		const { id: rowId, ...values } = data;
		await withDb((db) => (rowId ? db.update(skills).set(values).where(eq(skills.id, rowId)) : db.insert(skills).values(values)));
		return { ok: true as const };
	});
export const deleteSkill = createServerFn({ method: "POST" })
	.validator((i: unknown) => id.parse(i))
	.handler(async ({ data }) => {
		await requireOwner();
		await withDb((db) => db.delete(skills).where(eq(skills.id, data.id)));
		return { ok: true as const };
	});

/* ── Messages ── */
/* ── Payments (PayPal) ── */
export const listPayments = createServerFn({ method: "GET" }).handler(async () => {
	await requireOwner();
	return withDb((db) => db.select().from(payments).orderBy(desc(payments.createdAt)).limit(200));
});

export const listMessages = createServerFn({ method: "GET" }).handler(async () => {
	await requireOwner();
	return withDb((db) => db.select().from(messages).orderBy(desc(messages.createdAt)).limit(200));
});
export const setMessageRead = createServerFn({ method: "POST" })
	.validator((i: unknown) => z.object({ id: z.number().int().positive(), read: z.boolean() }).parse(i))
	.handler(async ({ data }) => {
		await requireOwner();
		await withDb((db) => db.update(messages).set({ read: data.read }).where(eq(messages.id, data.id)));
		return { ok: true as const };
	});
export const deleteMessage = createServerFn({ method: "POST" })
	.validator((i: unknown) => id.parse(i))
	.handler(async ({ data }) => {
		await requireOwner();
		await withDb((db) => db.delete(messages).where(eq(messages.id, data.id)));
		return { ok: true as const };
	});
