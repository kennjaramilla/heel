CREATE TYPE "public"."booking_status" AS ENUM('held', 'confirmed', 'completed', 'cancelled', 'expired');--> statement-breakpoint
CREATE TABLE "booking" (
	"id" text PRIMARY KEY NOT NULL,
	"trainer_id" text NOT NULL,
	"owner_id" text NOT NULL,
	"pet_id" text,
	"pet_name" text NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"length_minutes" integer NOT NULL,
	"status" "booking_status" DEFAULT 'held' NOT NULL,
	"hold_expires_at" timestamp with time zone,
	"price_cents" integer NOT NULL,
	"platform_fee_cents" integer NOT NULL,
	"trainer_payout_cents" integer NOT NULL,
	"payment_provider" text,
	"payment_ref" text,
	"owner_note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "booking_times" CHECK ("booking"."ends_at" > "booking"."starts_at"),
	CONSTRAINT "booking_money" CHECK ("booking"."platform_fee_cents" + "booking"."trainer_payout_cents" = "booking"."price_cents")
);
--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_trainer_id_user_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_pet_id_pet_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pet"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "booking_trainer_starts_idx" ON "booking" USING btree ("trainer_id","starts_at");--> statement-breakpoint
CREATE INDEX "booking_owner_starts_idx" ON "booking" USING btree ("owner_id","starts_at");