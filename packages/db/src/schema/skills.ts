import { integer, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const skills = pgTable("skills", {
	id: serial("id").primaryKey(),
	nameEn: varchar("name_en", { length: 255 }).notNull(),
	nameAr: varchar("name_ar", { length: 255 }).notNull(),
	levelEn: varchar("level_en", { length: 50 }).notNull(),
	levelAr: varchar("level_ar", { length: 50 }).notNull(),
	years: integer("years"),
	descriptionEn: text("description_en").notNull(),
	descriptionAr: text("description_ar").notNull(),
	categoryEn: varchar("category_en", { length: 50 }).notNull(),
	categoryAr: varchar("category_ar", { length: 50 }).notNull(),
});

export const skillSpecializations = pgTable("skill_specializations", {
	id: serial("id").primaryKey(),
	nameEn: varchar("name_en", { length: 255 }).notNull(),
	nameAr: varchar("name_ar", { length: 255 }).notNull(),
});

export type Skill = typeof skills.$inferSelect;
export type NewSkill = typeof skills.$inferInsert;
export type SkillSpecialization = typeof skillSpecializations.$inferSelect;
export type NewSkillSpecialization = typeof skillSpecializations.$inferInsert;
