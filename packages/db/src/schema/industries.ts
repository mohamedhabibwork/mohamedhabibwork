import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const industries = pgTable("industries", {
	id: serial("id").primaryKey(),
	industryId: varchar("industry_id", { length: 100 }).notNull().unique(),
	nameEn: varchar("name_en", { length: 255 }).notNull(),
	nameAr: varchar("name_ar", { length: 255 }).notNull(),
	descriptionEn: text("description_en").notNull(),
	descriptionAr: text("description_ar").notNull(),
});

export type Industry = typeof industries.$inferSelect;
export type NewIndustry = typeof industries.$inferInsert;
