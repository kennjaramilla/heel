CREATE TYPE "public"."species" AS ENUM('dog', 'cat');--> statement-breakpoint
CREATE TABLE "trainer_profile" (
	"user_id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"headline" text NOT NULL,
	"bio" text NOT NULL,
	"credentials" text DEFAULT '' NOT NULL,
	"city" text NOT NULL,
	"timezone" text NOT NULL,
	"years_experience" integer DEFAULT 0 NOT NULL,
	"species" "species"[] NOT NULL,
	"specialties" text[] NOT NULL,
	"languages" text[] NOT NULL,
	"price_30_cents" integer NOT NULL,
	"price_60_cents" integer NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "trainer_profile_slug_unique" UNIQUE("slug"),
	CONSTRAINT "trainer_price_30_range" CHECK ("trainer_profile"."price_30_cents" between 1000 and 50000),
	CONSTRAINT "trainer_price_60_range" CHECK ("trainer_profile"."price_60_cents" between 1000 and 50000)
);
--> statement-breakpoint
ALTER TABLE "trainer_profile" ADD CONSTRAINT "trainer_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "trainer_profile_published_idx" ON "trainer_profile" USING btree ("published");