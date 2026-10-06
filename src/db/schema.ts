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
	education: jsonb().$type<{ degree: string; school: string; start: string; end: string }[]>().notNull().default([]),
	certifications: text().array().notNull().default([]),
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

/** Services offered on /services. Each page has a contact form tagged with the service. */
export const services = pgTable(
	"services",
	{
		id: serial().primaryKey(),
		slug: text().notNull(),
		title: text().notNull(),
		icon: text().notNull().default("code"),
		summary: text().notNull().default(""),
		/** Long-form copy for /services/$slug. Paragraphs separated by blank lines. */
		description: text().notNull().default(""),
		deliverables: text().array().notNull().default([]),
		tech: text().array().notNull().default([]),
		startingAt: text("starting_at").notNull().default(""),
		published: boolean().notNull().default(true),
		sort: integer().notNull().default(0),
		...timestamps,
	},
	(t) => [uniqueIndex("services_slug_idx").on(t.slug)],
);

/** Contact-form submissions from the public site. */
export const messages = pgTable(
	"messages",
	{
		id: serial().primaryKey(),
		name: text().notNull(),
		email: text().notNull(),
		subject: text().notNull().default(""),
		/** Slug of the service the visitor enquired about, if any. */
		service: text().notNull().default(""),
		body: text().notNull(),
		read: boolean().notNull().default(false),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(t) => [index("messages_created_idx").on(t.createdAt)],
);

/**
 * PayPal checkout for a priced service. One row per PayPal order, created when the buyer opens
 * checkout and updated by the capture call and by verified webhooks (which win if they arrive later).
 */
export const payments = pgTable(
	"payments",
	{
		id: serial().primaryKey(),
		paypalOrderId: text("paypal_order_id").notNull(),
		captureId: text("capture_id").notNull().default(""),
		/** Slug of the service paid for. */
		service: text().notNull(),
		/** Decimal string as PayPal returns it, e.g. "100.00". */
		amount: text().notNull(),
		currency: text().notNull(),
		/** PayPal status: CREATED, APPROVED, COMPLETED, PENDING, DECLINED, DENIED, REFUNDED, REVERSED, FAILED. */
		status: text().notNull(),
		payerName: text("payer_name").notNull().default(""),
		payerEmail: text("payer_email").notNull().default(""),
		/** What the buyer wants to discuss, entered before paying. */
		notes: text().notNull().default(""),
		/** Total refunded so far (PayPal's cumulative figure), decimal string; "" when nothing was refunded. */
		refundedAmount: text("refunded_amount").notNull().default(""),
		/** PayPal app that took the payment: "live" (real money) or "sandbox" (test). */
		environment: text().notNull().default("live"),
		...timestamps,
	},
	(t) => [uniqueIndex("payments_order_idx").on(t.paypalOrderId), index("payments_created_idx").on(t.createdAt)],
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
