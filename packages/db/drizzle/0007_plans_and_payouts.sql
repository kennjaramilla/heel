CREATE TYPE "public"."payout_status" AS ENUM('not_due', 'pending', 'paid');--> statement-breakpoint
CREATE TABLE "training_plan" (
	"booking_id" text PRIMARY KEY NOT NULL,
	"summary" text NOT NULL,
	"steps" text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "completed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "payout_status" "payout_status" DEFAULT 'not_due' NOT NULL;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "payout_due_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "payout_ref" text;--> statement-breakpoint
ALTER TABLE "training_plan" ADD CONSTRAINT "training_plan_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE cascade ON UPDATE no action;