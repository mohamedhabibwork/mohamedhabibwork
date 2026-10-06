CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"paypal_order_id" text NOT NULL,
	"capture_id" text DEFAULT '' NOT NULL,
	"service" text NOT NULL,
	"amount" text NOT NULL,
	"currency" text NOT NULL,
	"status" text NOT NULL,
	"payer_name" text DEFAULT '' NOT NULL,
	"payer_email" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"environment" text DEFAULT 'live' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "payments_order_idx" ON "payments" USING btree ("paypal_order_id");--> statement-breakpoint
CREATE INDEX "payments_created_idx" ON "payments" USING btree ("created_at");--> statement-breakpoint
-- The paid consultation offered on the site (kept as-is if it already exists, e.g. added in the dashboard).
INSERT INTO "services" ("slug", "title", "icon", "summary", "description", "deliverables", "tech", "starting_at", "published", "sort")
VALUES (
	'consultation',
	'1-hour technical consultation',
	'phone',
	$$A focused one-hour video call on your architecture, stack, scaling or hiring questions — with written follow-up notes.$$,
	$$Bring a specific problem: an architecture decision, a slow system, a stack choice, a payment or real-time integration, or how to structure your team.

We meet for one hour on Google Meet or Zoom, and you get a short written summary with recommendations and next steps afterwards. Book directly, or message me first if you're not sure it's the right fit.$$,
	ARRAY['60-minute video call', 'Architecture and code review on the call', 'Written summary and next steps', 'Follow-up questions by email for a week'],
	ARRAY['System design', '.NET', 'Laravel', 'React', 'Cloud'],
	'$100 / hour',
	true,
	-1
)
ON CONFLICT ("slug") DO NOTHING;