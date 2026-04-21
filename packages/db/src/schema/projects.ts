import { boolean, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
	id: serial("id").primaryKey(),
	projectId: varchar("project_id", { length: 100 }).notNull().unique(),
	titleEn: varchar("title_en", { length: 255 }).notNull(),
	titleAr: varchar("title_ar", { length: 255 }).notNull(),
	categoryEn: varchar("category_en", { length: 100 }).notNull(),
	categoryAr: varchar("category_ar", { length: 100 }).notNull(),
	companyEn: varchar("company_en", { length: 255 }).notNull(),
	companyAr: varchar("company_ar", { length: 255 }).notNull(),
	descriptionEn: text("description_en").notNull(),
	descriptionAr: text("description_ar").notNull(),
	featuresEn: text("features_en").array().notNull(),
	featuresAr: text("features_ar").array().notNull(),
	techStack: text("tech_stack").array().notNull(),
	year: varchar("year", { length: 50 }).notNull(),
	url: varchar("url", { length: 255 }),
});

export const projectCategories = pgTable("project_categories", {
	id: serial("id").primaryKey(),
	nameEn: varchar("name_en", { length: 100 }).notNull().unique(),
	nameAr: varchar("name_ar", { length: 100 }).notNull(),
	isDefault: boolean("is_default").default(false).notNull(),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ProjectCategory = typeof projectCategories.$inferSelect;
export type NewProjectCategory = typeof projectCategories.$inferInsert;
