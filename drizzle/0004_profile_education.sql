ALTER TABLE "profile" ADD COLUMN "education" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "certifications" text[] DEFAULT '{}' NOT NULL;