import { z } from "zod";

const shortText = z.string().trim().max(200);
const longText = z.string().trim().max(4000);

export const cvExperienceSchema = z.object({
	role: shortText,
	company: shortText,
	location: shortText.default(""),
	start: z.string().trim().max(20).default(""),
	end: z.string().trim().max(20).default(""),
	current: z.boolean().default(false),
	bullets: z.array(z.string().trim().max(400)).max(12).default([]),
});

export const cvEducationSchema = z.object({
	degree: shortText,
	school: shortText,
	start: z.string().trim().max(20).default(""),
	end: z.string().trim().max(20).default(""),
});

export const cvProjectSchema = z.object({
	name: shortText,
	description: z.string().trim().max(600).default(""),
	tech: z.array(z.string().trim().max(60)).max(20).default([]),
	url: z.string().trim().max(300).default(""),
});

export const cvSkillGroupSchema = z.object({
	name: shortText,
	items: z.array(z.string().trim().max(60)).max(30),
});

export const cvDataSchema = z.object({
	name: shortText.min(1),
	title: shortText.default(""),
	email: z.string().trim().max(200).default(""),
	phone: z.string().trim().max(40).default(""),
	location: shortText.default(""),
	website: z.string().trim().max(300).default(""),
	linkedin: z.string().trim().max(300).default(""),
	github: z.string().trim().max(300).default(""),
	photoUrl: z.string().trim().max(500).default(""),
	summary: longText.default(""),
	experience: z.array(cvExperienceSchema).max(30).default([]),
	education: z.array(cvEducationSchema).max(10).default([]),
	skills: z.array(cvSkillGroupSchema).max(12).default([]),
	projects: z.array(cvProjectSchema).max(20).default([]),
	certifications: z.array(shortText).max(20).default([]),
	languages: z.array(z.object({ name: shortText, level: shortText.default("") })).max(10).default([]),
});

export type CvData = z.infer<typeof cvDataSchema>;
export type CvExperience = z.infer<typeof cvExperienceSchema>;

export const CV_TEMPLATES = ["modern", "classic", "compact"] as const;
export type CvTemplate = (typeof CV_TEMPLATES)[number];

/** Accents that keep 4.5:1 on white paper (see the design system's CvPreview). */
export const CV_ACCENTS = [
	{ value: "#3d5806", label: "Olive (brand)" },
	{ value: "#0b0d0a", label: "Carbon" },
	{ value: "#2366a8", label: "Blue" },
	{ value: "#8f5400", label: "Amber" },
	{ value: "#7a5fc9", label: "Violet" },
] as const;

export const cvMetaSchema = z.object({
	title: z.string().trim().min(1).max(120),
	slug: z
		.string()
		.trim()
		.min(2)
		.max(60)
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes"),
	template: z.enum(CV_TEMPLATES),
	accent: z.string().regex(/^#[0-9a-f]{6}$/i),
	isPublic: z.boolean(),
});

export function emptyCv(name = ""): CvData {
	return cvDataSchema.parse({ name: name || "Your name" });
}
