CREATE TABLE "contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"subject" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "experience" (
	"id" serial PRIMARY KEY NOT NULL,
	"period_en" varchar(100) NOT NULL,
	"period_ar" varchar(100) NOT NULL,
	"company_en" varchar(255) NOT NULL,
	"company_ar" varchar(255) NOT NULL,
	"role_en" varchar(255) NOT NULL,
	"role_ar" varchar(255) NOT NULL,
	"description_en" text NOT NULL,
	"description_ar" text NOT NULL,
	"tech" text[] NOT NULL,
	"current" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "industries" (
	"id" serial PRIMARY KEY NOT NULL,
	"industry_id" varchar(100) NOT NULL,
	"name_en" varchar(255) NOT NULL,
	"name_ar" varchar(255) NOT NULL,
	"description_en" text NOT NULL,
	"description_ar" text NOT NULL,
	CONSTRAINT "industries_industry_id_unique" UNIQUE("industry_id")
);
--> statement-breakpoint
CREATE TABLE "profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"name_en" varchar(255) NOT NULL,
	"name_ar" varchar(255) NOT NULL,
	"title_en" varchar(255) NOT NULL,
	"title_ar" varchar(255) NOT NULL,
	"tagline_en" text NOT NULL,
	"tagline_ar" text NOT NULL,
	"email" varchar(255) NOT NULL,
	"whatsapp" varchar(50) NOT NULL,
	"linkedin" varchar(255) NOT NULL,
	"github" varchar(255) NOT NULL,
	"location_en" varchar(255) NOT NULL,
	"location_ar" varchar(255) NOT NULL,
	"timezone" varchar(50) NOT NULL,
	"availability_en" varchar(255) NOT NULL,
	"availability_ar" varchar(255) NOT NULL,
	"bio_en" text NOT NULL,
	"bio_ar" text NOT NULL,
	"stats_years" integer NOT NULL,
	"stats_projects" integer NOT NULL,
	"stats_industries" integer NOT NULL,
	"stats_success_rate" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name_en" varchar(100) NOT NULL,
	"name_ar" varchar(100) NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	CONSTRAINT "project_categories_name_en_unique" UNIQUE("name_en")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" varchar(100) NOT NULL,
	"title_en" varchar(255) NOT NULL,
	"title_ar" varchar(255) NOT NULL,
	"category_en" varchar(100) NOT NULL,
	"category_ar" varchar(100) NOT NULL,
	"company_en" varchar(255) NOT NULL,
	"company_ar" varchar(255) NOT NULL,
	"description_en" text NOT NULL,
	"description_ar" text NOT NULL,
	"features_en" text[] NOT NULL,
	"features_ar" text[] NOT NULL,
	"tech_stack" text[] NOT NULL,
	"year" varchar(50) NOT NULL,
	"url" varchar(255),
	CONSTRAINT "projects_project_id_unique" UNIQUE("project_id")
);
--> statement-breakpoint
CREATE TABLE "skill_specializations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name_en" varchar(255) NOT NULL,
	"name_ar" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"name_en" varchar(255) NOT NULL,
	"name_ar" varchar(255) NOT NULL,
	"level_en" varchar(50) NOT NULL,
	"level_ar" varchar(50) NOT NULL,
	"years" integer,
	"description_en" text NOT NULL,
	"description_ar" text NOT NULL,
	"category_en" varchar(50) NOT NULL,
	"category_ar" varchar(50) NOT NULL
);
