import { boolean, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const experience = pgTable("experience", {
	id: serial("id").primaryKey(),
	periodEn: varchar("period_en", { length: 100 }).notNull(),
	periodAr: varchar("period_ar", { length: 100 }).notNull(),
	companyEn: varchar("company_en", { length: 255 }).notNull(),
	companyAr: varchar("company_ar", { length: 255 }).notNull(),
	roleEn: varchar("role_en", { length: 255 }).notNull(),
	roleAr: varchar("role_ar", { length: 255 }).notNull(),
	descriptionEn: text("description_en").notNull(),
	descriptionAr: text("description_ar").notNull(),
	tech: text("tech").array().notNull(),
	current: boolean("current").default(false).notNull(),
});

export type Experience = typeof experience.$inferSelect;
export type NewExperience = typeof experience.$inferInsert;
