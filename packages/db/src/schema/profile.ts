import {
	integer,
	pgTable,
	serial,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

export const profile = pgTable("profile", {
	id: serial("id").primaryKey(),
	nameEn: varchar("name_en", { length: 255 }).notNull(),
	nameAr: varchar("name_ar", { length: 255 }).notNull(),
	titleEn: varchar("title_en", { length: 255 }).notNull(),
	titleAr: varchar("title_ar", { length: 255 }).notNull(),
	taglineEn: text("tagline_en").notNull(),
	taglineAr: text("tagline_ar").notNull(),
	email: varchar("email", { length: 255 }).notNull(),
	whatsapp: varchar("whatsapp", { length: 50 }).notNull(),
	linkedin: varchar("linkedin", { length: 255 }).notNull(),
	github: varchar("github", { length: 255 }).notNull(),
	locationEn: varchar("location_en", { length: 255 }).notNull(),
	locationAr: varchar("location_ar", { length: 255 }).notNull(),
	timezone: varchar("timezone", { length: 50 }).notNull(),
	availabilityEn: varchar("availability_en", { length: 255 }).notNull(),
	availabilityAr: varchar("availability_ar", { length: 255 }).notNull(),
	bioEn: text("bio_en").notNull(),
	bioAr: text("bio_ar").notNull(),
	statsYears: integer("stats_years").notNull(),
	statsProjects: integer("stats_projects").notNull(),
	statsIndustries: integer("stats_industries").notNull(),
	statsSuccessRate: integer("stats_success_rate").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Profile = typeof profile.$inferSelect;
export type NewProfile = typeof profile.$inferInsert;
