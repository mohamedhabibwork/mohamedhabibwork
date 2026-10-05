import {
	boolean,
	index,
	integer,
	jsonb,
	pgTable,
	serial,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import type { AtsResult } from "#/server/ats";
import type { CvData } from "#/server/cv-schema";

const timestamps = {
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
};

/** The site owner's public profile. A single row (id = 1). */
export const profile = pgTable("profile", {
	id: integer().primaryKey().default(1),
	name: text().notNull(),
	headline: text().notNull(),
	tagline: text().notNull().default(""),
	summary: text().notNull().default(""),
	email: text().notNull(),
	phone: text().notNull().default(""),
	location: text().notNull().default(""),
	website: text().notNull().default(""),
	github: text().notNull().default(""),
	linkedin: text().notNull().default(""),
	availability: text().notNull().default(""),
	photoUrl: text("photo_url").notNull().default("/brand/marks/mh-mark.svg"),
	stats: jsonb().$type<{ label: string; value: string }[]>().notNull().default([]),
	...timestamps,
});

export const experiences = pgTable("experiences", {
	id: serial().primaryKey(),
	company: text().notNull(),
	role: text().notNull(),
	location: text().notNull().default(""),
	start: text().notNull(),
	end: text().notNull().default(""),
	current: boolean().notNull().default(false),
	summary: text().notNull().default(""),
	highlights: text().array().notNull().default([]),
	tech: text().array().notNull().default([]),
	sort: integer().notNull().default(0),
	...timestamps,
});

export const projects = pgTable(
	"projects",
	{
		id: serial().primaryKey(),
		slug: text().notNull(),
		title: text().notNull(),
		subtitle: text().notNull().default(""),
		category: text().notNull().default(""),
		year: text().notNull().default(""),
		summary: text().notNull().default(""),
		/** Long-form case study shown on /projects/$slug. Paragraphs separated by blank lines. */
		description: text().notNull().default(""),
		role: text().notNull().default(""),
		challenge: text().notNull().default(""),
		outcomes: text().array().notNull().default([]),
		features: text().array().notNull().default([]),
		tech: text().array().notNull().default([]),
		url: text().notNull().default(""),
		imageUrl: text("image_url").notNull().default(""),
		featured: boolean().notNull().default(false),
		published: boolean().notNull().default(true),
		sort: integer().notNull().default(0),
		...timestamps,
	},
	(t) => [uniqueIndex("projects_slug_idx").on(t.slug)],
);

export const skills = pgTable("skills", {
	id: serial().primaryKey(),
	name: text().notNull(),
	category: text().notNull().default("Other"),
	level: integer().notNull().default(3),
	years: integer(),
	sort: integer().notNull().default(0),
	...timestamps,
});

/** Contact-form submissions from the public site. */
export const messages = pgTable(
	"messages",
	{
		id: serial().primaryKey(),
		name: text().notNull(),
		email: text().notNull(),
		subject: text().notNull().default(""),
		body: text().notNull(),
		read: boolean().notNull().default(false),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(t) => [index("messages_created_idx").on(t.createdAt)],
);

/** A CV built in the dashboard. `data` is the full document; `isPublic` exposes its PDF endpoint. */
export const cvs = pgTable(
	"cvs",
	{
		id: serial().primaryKey(),
		slug: text().notNull(),
		title: text().notNull(),
		template: text().notNull().default("modern"),
		accent: text().notNull().default("#3d5806"),
		isPublic: boolean("is_public").notNull().default(false),
		data: jsonb().$type<CvData>().notNull(),
		...timestamps,
	},
	(t) => [uniqueIndex("cvs_slug_idx").on(t.slug)],
);

export const atsReports = pgTable(
	"ats_reports",
	{
		id: serial().primaryKey(),
		cvId: integer("cv_id")
			.notNull()
			.references(() => cvs.id, { onDelete: "cascade" }),
		jobTitle: text("job_title").notNull().default(""),
		jobDescription: text("job_description").notNull(),
		score: integer().notNull(),
		result: jsonb().$type<AtsResult>().notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(t) => [index("ats_reports_cv_idx").on(t.cvId)],
);

/** Owner sign-in sessions. The cookie holds `id`; rows expire. */
export const sessions = pgTable("sessions", {
	id: text().primaryKey(),
	expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
