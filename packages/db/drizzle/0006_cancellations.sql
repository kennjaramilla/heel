CREATE TYPE "public"."cancelled_by" AS ENUM('owner', 'trainer', 'admin');--> statement-breakpoint
ALTER TABLE "booking" DROP CONSTRAINT "booking_money";--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "refund_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "refund_ref" text;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "cancelled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "cancelled_by" "cancelled_by";--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "cancel_reason" text;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_money" CHECK ("booking"."platform_fee_cents" + "booking"."trainer_payout_cents" + "booking"."refund_cents" = "booking"."price_cents");