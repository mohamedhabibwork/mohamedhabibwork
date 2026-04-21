import { contacts } from "@habib-app/db/schema/contacts";
import { experience } from "@habib-app/db/schema/experience";
import { industries } from "@habib-app/db/schema/industries";
import { profile } from "@habib-app/db/schema/profile";
import { projectCategories, projects } from "@habib-app/db/schema/projects";
import { skillSpecializations, skills } from "@habib-app/db/schema/skills";
import { os } from "@orpc/server";
import { z } from "zod/v4";
import type { Context } from "../context";

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

			return {
				success: true,
				message: "Thank you for your message. I'll get back to you soon!",
			};
		}),
};

export type AppRouter = typeof appRouter;
