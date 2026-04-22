import { contacts } from "@habib-app/db/schema/contacts";
import { experience } from "@habib-app/db/schema/experience";
import { industries } from "@habib-app/db/schema/industries";
import { profile } from "@habib-app/db/schema/profile";
import { projectCategories, projects } from "@habib-app/db/schema/projects";
import { skillSpecializations, skills } from "@habib-app/db/schema/skills";
import { os } from "@orpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";
import type { Context } from "../context";
import { formatContactEmail, sendEmail } from "../lib/email";

const o = os.$context<Context>();

const contactSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.email("Please enter a valid email address"),
	subject: z.string().min(5, "Subject must be at least 5 characters"),
	message: z.string().min(20, "Message must be at least 20 characters"),
});

const profileSchema = z.object({
	name: z.string(),
	title: z.string(),
	tagline: z.string(),
	email: z.string(),
	whatsapp: z.string().nullable(),
	linkedin: z.string().nullable(),
	github: z.string().nullable(),
	location: z.string(),
	timezone: z.string(),
	availability: z.string(),
	bio: z.string(),
	stats: z.object({
		years: z.number(),
		projects: z.number(),
		industries: z.number(),
		successRate: z.number(),
	}),
});

const skillSchema = z.object({
	id: z.number(),
	name: z.string(),
	level: z.string(),
	years: z.number().nullable(),
	description: z.string(),
	category: z.string(),
});

const projectSchema = z.object({
	id: z.string(),
	title: z.string(),
	category: z.string(),
	company: z.string(),
	description: z.string(),
	features: z.array(z.string()),
	techStack: z.array(z.string()),
	year: z.string(),
	url: z.string().nullable(),
});

const experienceSchema = z.object({
	id: z.number(),
	period: z.string(),
	company: z.string(),
	role: z.string(),
	description: z.string(),
	tech: z.array(z.string()),
	current: z.boolean(),
});

const industrySchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
});

const contactResponseSchema = z.object({
	success: z.boolean(),
	message: z.string(),
});

const contactUpdateSchema = contactSchema.partial();

const projectInputSchema = z.object({
	projectId: z.string().min(1, "Project ID is required"),
	titleEn: z.string().min(1, "English title is required"),
	titleAr: z.string().min(1, "Arabic title is required"),
	categoryEn: z.string().min(1, "English category is required"),
	categoryAr: z.string().min(1, "Arabic category is required"),
	companyEn: z.string().min(1, "English company is required"),
	companyAr: z.string().min(1, "Arabic company is required"),
	descriptionEn: z.string().min(1, "English description is required"),
	descriptionAr: z.string().min(1, "Arabic description is required"),
	featuresEn: z.array(z.string()),
	featuresAr: z.array(z.string()),
	techStack: z.array(z.string()),
	year: z.string().min(1, "Year is required"),
	url: z.string().nullable(),
});

const projectUpdateSchema = projectInputSchema
	.omit({ projectId: true })
	.partial();

const skillInputSchema = z.object({
	nameEn: z.string().min(1, "English name is required"),
	nameAr: z.string().min(1, "Arabic name is required"),
	levelEn: z.string().min(1, "English level is required"),
	levelAr: z.string().min(1, "Arabic level is required"),
	years: z.number().int().positive().nullable(),
	descriptionEn: z.string().min(1, "English description is required"),
	descriptionAr: z.string().min(1, "Arabic description is required"),
	categoryEn: z.string().min(1, "English category is required"),
	categoryAr: z.string().min(1, "Arabic category is required"),
});

const skillUpdateSchema = skillInputSchema.partial();

const experienceInputSchema = z.object({
	periodEn: z.string().min(1, "English period is required"),
	periodAr: z.string().min(1, "Arabic period is required"),
	companyEn: z.string().min(1, "English company is required"),
	companyAr: z.string().min(1, "Arabic company is required"),
	roleEn: z.string().min(1, "English role is required"),
	roleAr: z.string().min(1, "Arabic role is required"),
	descriptionEn: z.string().min(1, "English description is required"),
	descriptionAr: z.string().min(1, "Arabic description is required"),
	tech: z.array(z.string()),
	current: z.boolean().default(false),
});

const experienceUpdateSchema = experienceInputSchema.partial();

const industryInputSchema = z.object({
	industryId: z.string().min(1, "Industry ID is required"),
	nameEn: z.string().min(1, "English name is required"),
	nameAr: z.string().min(1, "Arabic name is required"),
	descriptionEn: z.string().min(1, "English description is required"),
	descriptionAr: z.string().min(1, "Arabic description is required"),
});

const industryUpdateSchema = industryInputSchema
	.omit({ industryId: true })
	.partial();

const profileInputSchema = z.object({
	nameEn: z.string().min(1, "English name is required"),
	nameAr: z.string().min(1, "Arabic name is required"),
	titleEn: z.string().min(1, "English title is required"),
	titleAr: z.string().min(1, "Arabic title is required"),
	taglineEn: z.string().min(1, "English tagline is required"),
	taglineAr: z.string().min(1, "Arabic tagline is required"),
	email: z.email("Please enter a valid email"),
	whatsapp: z.string(),
	linkedin: z.string(),
	github: z.string(),
	locationEn: z.string().min(1, "English location is required"),
	locationAr: z.string().min(1, "Arabic location is required"),
	timezone: z.string().min(1, "Timezone is required"),
	availabilityEn: z.string().min(1, "English availability is required"),
	availabilityAr: z.string().min(1, "Arabic availability is required"),
	bioEn: z.string().min(1, "English bio is required"),
	bioAr: z.string().min(1, "Arabic bio is required"),
	statsYears: z.number().int().min(0),
	statsProjects: z.number().int().min(0),
	statsIndustries: z.number().int().min(0),
	statsSuccessRate: z.number().int().min(0).max(100),
});

const profileUpdateSchema = profileInputSchema.partial();

const idParamSchema = z.object({
	id: z.coerce.number().int().positive("ID must be a positive integer"),
});

const projectIdParamSchema = z.object({
	projectId: z.string().min(1, "Project ID is required"),
});

const industryIdParamSchema = z.object({
	industryId: z.string().min(1, "Industry ID is required"),
});

function mapProfile(p: typeof profile.$inferSelect, locale: string) {
	const isArabic = locale === "ar";
	return {
		name: isArabic ? p.nameAr : p.nameEn,
		title: isArabic ? p.titleAr : p.titleEn,
		tagline: isArabic ? p.taglineAr : p.taglineEn,
		email: p.email,
		whatsapp: p.whatsapp,
		linkedin: p.linkedin,
		github: p.github,
		location: isArabic ? p.locationAr : p.locationEn,
		timezone: p.timezone,
		availability: isArabic ? p.availabilityAr : p.availabilityEn,
		bio: isArabic ? p.bioAr : p.bioEn,
		stats: {
			years: p.statsYears,
			projects: p.statsProjects,
			industries: p.statsIndustries,
			successRate: p.statsSuccessRate,
		},
	};
}

function mapSkill(s: typeof skills.$inferSelect, locale: string) {
	const isArabic = locale === "ar";
	return {
		id: s.id,
		name: isArabic ? s.nameAr : s.nameEn,
		level: isArabic ? s.levelAr : s.levelEn,
		years: s.years,
		description: isArabic ? s.descriptionAr : s.descriptionEn,
		category: isArabic ? s.categoryAr : s.categoryEn,
	};
}

function mapProject(p: typeof projects.$inferSelect, locale: string) {
	const isArabic = locale === "ar";
	return {
		id: p.projectId,
		title: isArabic ? p.titleAr : p.titleEn,
		category: isArabic ? p.categoryAr : p.categoryEn,
		company: isArabic ? p.companyAr : p.companyEn,
		description: isArabic ? p.descriptionAr : p.descriptionEn,
		features: isArabic ? p.featuresAr : p.featuresEn,
		techStack: p.techStack,
		year: p.year,
		url: p.url,
	};
}

function mapExperience(e: typeof experience.$inferSelect, locale: string) {
	const isArabic = locale === "ar";
	return {
		id: e.id,
		period: isArabic ? e.periodAr : e.periodEn,
		company: isArabic ? e.companyAr : e.companyEn,
		role: isArabic ? e.roleAr : e.roleEn,
		description: isArabic ? e.descriptionAr : e.descriptionEn,
		tech: e.tech,
		current: e.current,
	};
}

function mapIndustry(i: typeof industries.$inferSelect, locale: string) {
	const isArabic = locale === "ar";
	return {
		id: i.industryId,
		name: isArabic ? i.nameAr : i.nameEn,
		description: isArabic ? i.descriptionAr : i.descriptionEn,
	};
}

export const appRouter = {
	healthCheck: o.handler(() => "OK"),

	// Profile endpoint
	profile: o.output(profileSchema.nullable()).handler(async ({ context }) => {
		const result = await context.db.select().from(profile).limit(1);
		const p = result[0];
		return p ? mapProfile(p, context.locale) : null;
	}),

	// Skills endpoint
	skills: o
		.output(
			z.object({
				backend: z.array(skillSchema),
				frontend: z.array(skillSchema),
				database: z.array(skillSchema),
				cloud: z.array(skillSchema),
				leadership: z.array(skillSchema),
				specializations: z.array(z.string()),
			})
		)
		.handler(async ({ context }) => {
			const allSkills = await context.db.select().from(skills);
			const specializations = await context.db
				.select()
				.from(skillSpecializations);

			const mappedSkills = allSkills.map((s) => mapSkill(s, context.locale));

			const isArabic = context.locale === "ar";
			return {
				backend: mappedSkills.filter(
					(s) => s.category === (isArabic ? "الخلفية" : "backend")
				),
				frontend: mappedSkills.filter(
					(s) => s.category === (isArabic ? "الواجهة الأمامية" : "frontend")
				),
				database: mappedSkills.filter(
					(s) => s.category === (isArabic ? "قواعد البيانات" : "database")
				),
				cloud: mappedSkills.filter(
					(s) => s.category === (isArabic ? "السحابة" : "cloud")
				),
				leadership: mappedSkills.filter(
					(s) => s.category === (isArabic ? "القيادة" : "leadership")
				),
				specializations: specializations.map((s) =>
					isArabic ? s.nameAr : s.nameEn
				),
			};
		}),

	// Projects endpoint
	projects: o
		.output(
			z.object({
				projects: z.array(projectSchema),
				categories: z.array(z.string()),
			})
		)
		.handler(async ({ context }) => {
			const allProjects = await context.db.select().from(projects);
			const categories = await context.db
				.select()
				.from(projectCategories)
				.orderBy(projectCategories.isDefault);

			return {
				projects: allProjects.map((p) => mapProject(p, context.locale)),
				categories: categories.map((c) =>
					context.locale === "ar" ? c.nameAr : c.nameEn
				),
			};
		}),

	// Experience endpoint
	experience: o
		.output(z.array(experienceSchema))
		.handler(async ({ context }) => {
			const items = await context.db.select().from(experience);
			return items.map((e) => mapExperience(e, context.locale));
		}),

	// Industries endpoint
	industries: o
		.output(z.object({ items: z.array(industrySchema) }))
		.handler(async ({ context }) => {
			const items = await context.db.select().from(industries);
			return {
				items: items.map((i) => mapIndustry(i, context.locale)),
			};
		}),

	// Contact form endpoint
	contact: o
		.input(contactSchema)
		.output(contactResponseSchema)
		.handler(async ({ input, context }) => {
			const { name, email, subject, message } = input;

			await context.db.insert(contacts).values({
				name,
				email,
				subject,
				message,
			});

			if (context.env.SMTP_TO) {
				await sendEmail(context, {
					to: context.env.SMTP_TO,
					subject: `Contact Form: ${subject}`,
					html: formatContactEmail(name, email, subject, message),
				});
			}

			return {
				success: true,
				message: "Thank you for your message. I'll get back to you soon!",
			};
		}),

	// ===== CONTACT CRUD =====
	contacts: {
		list: o
			.output(
				z.array(contactSchema.extend({ id: z.number(), createdAt: z.date() }))
			)
			.handler(async ({ context }) =>
				context.db.select().from(contacts).orderBy(contacts.createdAt)
			),
		get: o
			.input(idParamSchema)
			.output(
				contactSchema.extend({ id: z.number(), createdAt: z.date() }).nullable()
			)
			.handler(async ({ input, context }) => {
				const result = await context.db
					.select()
					.from(contacts)
					.where(eq(contacts.id, input.id));
				return result[0] ?? null;
			}),
		update: o
			.input(idParamSchema.merge(contactUpdateSchema))
			.output(contactResponseSchema)
			.handler(async ({ input, context }) => {
				const { id, ...rest } = input;
				const updated = await context.db
					.update(contacts)
					.set(rest)
					.where(eq(contacts.id, id))
					.returning();
				if (!updated[0]) {
					throw new Error("Contact not found");
				}
				return { success: true, message: "Contact updated successfully" };
			}),
		delete: o
			.input(idParamSchema)
			.output(contactResponseSchema)
			.handler(async ({ input, context }) => {
				const deleted = await context.db
					.delete(contacts)
					.where(eq(contacts.id, input.id))
					.returning();
				if (!deleted[0]) {
					throw new Error("Contact not found");
				}
				return { success: true, message: "Contact deleted successfully" };
			}),
	},

	// ===== PROJECT CRUD =====
	projectsCrud: {
		list: o.output(z.array(projectSchema)).handler(async ({ context }) => {
			const items = await context.db.select().from(projects);
			return items.map((p) => mapProject(p, context.locale));
		}),
		get: o
			.input(projectIdParamSchema)
			.output(projectSchema.nullable())
			.handler(async ({ input, context }) => {
				const result = await context.db
					.select()
					.from(projects)
					.where(eq(projects.projectId, input.projectId));
				const p = result[0];
				return p ? mapProject(p, context.locale) : null;
			}),
		create: o
			.input(projectInputSchema)
			.output(contactResponseSchema)
			.handler(async ({ input, context }) => {
				await context.db.insert(projects).values({
					projectId: input.projectId,
					titleEn: input.titleEn,
					titleAr: input.titleAr,
					categoryEn: input.categoryEn,
					categoryAr: input.categoryAr,
					companyEn: input.companyEn,
					companyAr: input.companyAr,
					descriptionEn: input.descriptionEn,
					descriptionAr: input.descriptionAr,
					featuresEn: input.featuresEn,
					featuresAr: input.featuresAr,
					techStack: input.techStack,
					year: input.year,
					url: input.url,
				});
				return { success: true, message: "Project created successfully" };
			}),
		update: o
			.input(projectIdParamSchema.merge(projectUpdateSchema))
			.output(contactResponseSchema)
			.handler(async ({ input, context }) => {
				const { projectId: pId, ...rest } = input;
				const projectId = pId as string;
				const updates: Record<string, unknown> = {};
				if (rest.titleEn !== undefined) {
					updates.titleEn = rest.titleEn;
				}
				if (rest.titleAr !== undefined) {
					updates.titleAr = rest.titleAr;
				}
				if (rest.categoryEn !== undefined) {
					updates.categoryEn = rest.categoryEn;
				}
				if (rest.categoryAr !== undefined) {
					updates.categoryAr = rest.categoryAr;
				}
				if (rest.companyEn !== undefined) {
					updates.companyEn = rest.companyEn;
				}
				if (rest.companyAr !== undefined) {
					updates.companyAr = rest.companyAr;
				}
				if (rest.descriptionEn !== undefined) {
					updates.descriptionEn = rest.descriptionEn;
				}
				if (rest.descriptionAr !== undefined) {
					updates.descriptionAr = rest.descriptionAr;
				}
				if (rest.featuresEn !== undefined) {
					updates.featuresEn = rest.featuresEn;
				}
				if (rest.featuresAr !== undefined) {
					updates.featuresAr = rest.featuresAr;
				}
				if (rest.techStack !== undefined) {
					updates.techStack = rest.techStack;
				}
				if (rest.year !== undefined) {
					updates.year = rest.year;
				}
				if (rest.url !== undefined) {
					updates.url = rest.url;
				}

				const updated = await context.db
					.update(projects)
					.set(updates)
					.where(eq(projects.projectId, projectId))
					.returning();
				if (!updated[0]) {
					throw new Error("Project not found");
				}
				return { success: true, message: "Project updated successfully" };
			}),
		delete: o
			.input(projectIdParamSchema)
			.output(contactResponseSchema)
			.handler(async ({ input, context }) => {
				const deleted = await context.db
					.delete(projects)
					.where(eq(projects.projectId, input.projectId))
					.returning();
				if (!deleted[0]) {
					throw new Error("Project not found");
				}
				return { success: true, message: "Project deleted successfully" };
			}),
	},

	// ===== SKILL CRUD =====
	skillsCrud: {
		list: o.output(z.array(skillSchema)).handler(async ({ context }) => {
			const items = await context.db.select().from(skills);
			return items.map((s) => mapSkill(s, context.locale));
		}),
		get: o
			.input(idParamSchema)
			.output(skillSchema.nullable())
			.handler(async ({ input, context }) => {
				const result = await context.db
					.select()
					.from(skills)
					.where(eq(skills.id, input.id));
				const s = result[0];
				return s ? mapSkill(s, context.locale) : null;
			}),
		create: o
			.input(skillInputSchema)
			.output(contactResponseSchema)
			.handler(async ({ input, context }) => {
				await context.db.insert(skills).values({
					nameEn: input.nameEn,
					nameAr: input.nameAr,
					levelEn: input.levelEn,
					levelAr: input.levelAr,
					years: input.years,
					descriptionEn: input.descriptionEn,
					descriptionAr: input.descriptionAr,
					categoryEn: input.categoryEn,
					categoryAr: input.categoryAr,
				});
				return { success: true, message: "Skill created successfully" };
			}),
		update: o
			.input(idParamSchema.merge(skillUpdateSchema))
			.output(contactResponseSchema)
			.handler(async ({ input, context }) => {
				const { id, ...rest } = input;
				const updates: Record<string, unknown> = {};
				if (rest.nameEn !== undefined) {
					updates.nameEn = rest.nameEn;
				}
				if (rest.nameAr !== undefined) {
					updates.nameAr = rest.nameAr;
				}
				if (rest.levelEn !== undefined) {
					updates.levelEn = rest.levelEn;
				}
				if (rest.levelAr !== undefined) {
					updates.levelAr = rest.levelAr;
				}
				if (rest.years !== undefined) {
					updates.years = rest.years;
				}
				if (rest.descriptionEn !== undefined) {
					updates.descriptionEn = rest.descriptionEn;
				}
				if (rest.descriptionAr !== undefined) {
					updates.descriptionAr = rest.descriptionAr;
				}
				if (rest.categoryEn !== undefined) {
					updates.categoryEn = rest.categoryEn;
				}
				if (rest.categoryAr !== undefined) {
					updates.categoryAr = rest.categoryAr;
				}

				const updated = await context.db
					.update(skills)
					.set(updates)
					.where(eq(skills.id, id))
					.returning();
				if (!updated[0]) {
					throw new Error("Skill not found");
				}
				return { success: true, message: "Skill updated successfully" };
			}),
		delete: o
			.input(idParamSchema)
			.output(contactResponseSchema)
			.handler(async ({ input, context }) => {
				const deleted = await context.db
					.delete(skills)
					.where(eq(skills.id, input.id))
					.returning();
				if (!deleted[0]) {
					throw new Error("Skill not found");
				}
				return { success: true, message: "Skill deleted successfully" };
			}),
	},

	// ===== EXPERIENCE CRUD =====
	experienceCrud: {
		list: o.output(z.array(experienceSchema)).handler(async ({ context }) => {
			const items = await context.db.select().from(experience);
			return items.map((e) => mapExperience(e, context.locale));
		}),
		get: o
			.input(idParamSchema)
			.output(experienceSchema.nullable())
			.handler(async ({ input, context }) => {
				const result = await context.db
					.select()
					.from(experience)
					.where(eq(experience.id, input.id));
				const e = result[0];
				return e ? mapExperience(e, context.locale) : null;
			}),
		create: o
			.input(experienceInputSchema)
			.output(contactResponseSchema)
			.handler(async ({ input, context }) => {
				await context.db.insert(experience).values({
					periodEn: input.periodEn,
					periodAr: input.periodAr,
					companyEn: input.companyEn,
					companyAr: input.companyAr,
					roleEn: input.roleEn,
					roleAr: input.roleAr,
					descriptionEn: input.descriptionEn,
					descriptionAr: input.descriptionAr,
					tech: input.tech,
					current: input.current,
				});
				return { success: true, message: "Experience created successfully" };
			}),
		update: o
			.input(idParamSchema.merge(experienceUpdateSchema))
			.output(contactResponseSchema)
			.handler(async ({ input, context }) => {
				const { id, ...rest } = input;
				const updates: Record<string, unknown> = {};
				if (rest.periodEn !== undefined) {
					updates.periodEn = rest.periodEn;
				}
				if (rest.periodAr !== undefined) {
					updates.periodAr = rest.periodAr;
				}
				if (rest.companyEn !== undefined) {
					updates.companyEn = rest.companyEn;
				}
				if (rest.companyAr !== undefined) {
					updates.companyAr = rest.companyAr;
				}
				if (rest.roleEn !== undefined) {
					updates.roleEn = rest.roleEn;
				}
				if (rest.roleAr !== undefined) {
					updates.roleAr = rest.roleAr;
				}
				if (rest.descriptionEn !== undefined) {
					updates.descriptionEn = rest.descriptionEn;
				}
				if (rest.descriptionAr !== undefined) {
					updates.descriptionAr = rest.descriptionAr;
				}
				if (rest.tech !== undefined) {
					updates.tech = rest.tech;
				}
				if (rest.current !== undefined) {
					updates.current = rest.current;
				}

				const updated = await context.db
					.update(experience)
					.set(updates)
					.where(eq(experience.id, id))
					.returning();
				if (!updated[0]) {
					throw new Error("Experience not found");
				}
				return { success: true, message: "Experience updated successfully" };
			}),
		delete: o
			.input(idParamSchema)
			.output(contactResponseSchema)
			.handler(async ({ input, context }) => {
				const deleted = await context.db
					.delete(experience)
					.where(eq(experience.id, input.id))
					.returning();
				if (!deleted[0]) {
					throw new Error("Experience not found");
				}
				return { success: true, message: "Experience deleted successfully" };
			}),
	},

	// ===== INDUSTRY CRUD =====
	industriesCrud: {
		list: o.output(z.array(industrySchema)).handler(async ({ context }) => {
			const items = await context.db.select().from(industries);
			return items.map((i) => mapIndustry(i, context.locale));
		}),
		get: o
			.input(industryIdParamSchema)
			.output(industrySchema.nullable())
			.handler(async ({ input, context }) => {
				const result = await context.db
					.select()
					.from(industries)
					.where(eq(industries.industryId, input.industryId));
				const i = result[0];
				return i ? mapIndustry(i, context.locale) : null;
			}),
		create: o
			.input(industryInputSchema)
			.output(contactResponseSchema)
			.handler(async ({ input, context }) => {
				await context.db.insert(industries).values({
					industryId: input.industryId,
					nameEn: input.nameEn,
					nameAr: input.nameAr,
					descriptionEn: input.descriptionEn,
					descriptionAr: input.descriptionAr,
				});
				return { success: true, message: "Industry created successfully" };
			}),
		update: o
			.input(industryIdParamSchema.merge(industryUpdateSchema))
			.output(contactResponseSchema)
			.handler(async ({ input, context }) => {
				const { industryId, ...rest } = input;
				const updates: Record<string, unknown> = {};
				if (rest.nameEn !== undefined) {
					updates.nameEn = rest.nameEn;
				}
				if (rest.nameAr !== undefined) {
					updates.nameAr = rest.nameAr;
				}
				if (rest.descriptionEn !== undefined) {
					updates.descriptionEn = rest.descriptionEn;
				}
				if (rest.descriptionAr !== undefined) {
					updates.descriptionAr = rest.descriptionAr;
				}

				const updated = await context.db
					.update(industries)
					.set(updates)
					.where(eq(industries.industryId, industryId))
					.returning();
				if (!updated[0]) {
					throw new Error("Industry not found");
				}
				return { success: true, message: "Industry updated successfully" };
			}),
		delete: o
			.input(industryIdParamSchema)
			.output(contactResponseSchema)
			.handler(async ({ input, context }) => {
				const deleted = await context.db
					.delete(industries)
					.where(eq(industries.industryId, input.industryId))
					.returning();
				if (!deleted[0]) {
					throw new Error("Industry not found");
				}
				return { success: true, message: "Industry deleted successfully" };
			}),
	},

	// ===== PROFILE CRUD =====
	profileCrud: {
		get: o.output(profileSchema.nullable()).handler(async ({ context }) => {
			const result = await context.db.select().from(profile).limit(1);
			const p = result[0];
			return p ? mapProfile(p, context.locale) : null;
		}),
		create: o
			.input(profileInputSchema)
			.output(contactResponseSchema)
			.handler(async ({ input, context }) => {
				await context.db.insert(profile).values({
					nameEn: input.nameEn,
					nameAr: input.nameAr,
					titleEn: input.titleEn,
					titleAr: input.titleAr,
					taglineEn: input.taglineEn,
					taglineAr: input.taglineAr,
					email: input.email,
					whatsapp: input.whatsapp,
					linkedin: input.linkedin,
					github: input.github,
					locationEn: input.locationEn,
					locationAr: input.locationAr,
					timezone: input.timezone,
					availabilityEn: input.availabilityEn,
					availabilityAr: input.availabilityAr,
					bioEn: input.bioEn,
					bioAr: input.bioAr,
					statsYears: input.statsYears,
					statsProjects: input.statsProjects,
					statsIndustries: input.statsIndustries,
					statsSuccessRate: input.statsSuccessRate,
				});
				return { success: true, message: "Profile created successfully" };
			}),
		update: o
			.input(profileUpdateSchema)
			.output(contactResponseSchema)
			.handler(async ({ input, context }) => {
				const updates = Object.fromEntries(
					Object.entries(input).filter(([, v]) => v !== undefined)
				);

				const updated = await context.db
					.update(profile)
					.set(updates)
					.where(eq(profile.id, 1))
					.returning();
				if (!updated[0]) {
					throw new Error("Profile not found");
				}
				return { success: true, message: "Profile updated successfully" };
			}),
	},

	resume: {
		generate: o
			.output(
				z.object({
					profile: profileSchema,
					skills: z.object({
						backend: z.array(skillSchema),
						frontend: z.array(skillSchema),
						database: z.array(skillSchema),
						cloud: z.array(skillSchema),
						leadership: z.array(skillSchema),
						specializations: z.array(z.string()),
					}),
					experience: z.array(experienceSchema),
					projects: z.array(projectSchema),
					industries: z.array(industrySchema),
				})
			)
			.handler(async ({ context }) => {
				const isArabic = context.locale === "ar";

				const profileResult = await context.db.select().from(profile).limit(1);
				const p = profileResult[0];

				const allSkills = await context.db.select().from(skills);
				const specializations = await context.db
					.select()
					.from(skillSpecializations);
				const experienceItems = await context.db.select().from(experience);
				const projectItems = await context.db.select().from(projects);
				const industryItems = await context.db.select().from(industries);

				const mappedProfile = p ? mapProfile(p, context.locale) : null;

				if (!mappedProfile) {
					throw new Error("Profile not found");
				}

				const mappedSkills = allSkills.map((s) => mapSkill(s, context.locale));

				return {
					profile: mappedProfile,
					skills: {
						backend: mappedSkills.filter(
							(s) => s.category === (isArabic ? "الخلفية" : "backend")
						),
						frontend: mappedSkills.filter(
							(s) => s.category === (isArabic ? "الواجهة الأمامية" : "frontend")
						),
						database: mappedSkills.filter(
							(s) => s.category === (isArabic ? "قواعد البيانات" : "database")
						),
						cloud: mappedSkills.filter(
							(s) => s.category === (isArabic ? "السحابة" : "cloud")
						),
						leadership: mappedSkills.filter(
							(s) => s.category === (isArabic ? "القيادة" : "leadership")
						),
						specializations: specializations.map((s) =>
							isArabic ? s.nameAr : s.nameEn
						),
					},
					experience: experienceItems.map((e) =>
						mapExperience(e, context.locale)
					),
					projects: projectItems.map((p) => mapProject(p, context.locale)),
					industries: industryItems.map((i) => mapIndustry(i, context.locale)),
				};
			}),
	},
};

export type AppRouter = typeof appRouter;
