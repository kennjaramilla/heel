CREATE TABLE "pet" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"name" text NOT NULL,
	"species" "species" NOT NULL,
	"breed" text DEFAULT '' NOT NULL,
	"born_on" date,
	"concerns" text[] DEFAULT '{}' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pet" ADD CONSTRAINT "pet_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pet_owner_id_idx" ON "pet" USING btree ("owner_id");