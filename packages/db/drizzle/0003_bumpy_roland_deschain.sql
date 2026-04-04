DROP TABLE "problems" CASCADE;--> statement-breakpoint
DROP TABLE "submissions" CASCADE;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "category" text;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "completed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "updated_at" timestamp DEFAULT now();