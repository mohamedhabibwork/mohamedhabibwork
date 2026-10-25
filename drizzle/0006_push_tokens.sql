CREATE TABLE "push_tokens" (
	"token" text PRIMARY KEY NOT NULL,
	"user_agent" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
