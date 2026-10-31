CREATE TABLE "availability_rule" (
	"id" serial PRIMARY KEY NOT NULL,
	"trainer_id" text NOT NULL,
	"weekday" smallint NOT NULL,
	"start_minute" integer NOT NULL,
	"end_minute" integer NOT NULL,
	CONSTRAINT "availability_weekday" CHECK ("availability_rule"."weekday" between 0 and 6),
	CONSTRAINT "availability_range" CHECK ("availability_rule"."start_minute" >= 0 and "availability_rule"."end_minute" <= 1440 and "availability_rule"."end_minute" > "availability_rule"."start_minute")
);
--> statement-breakpoint
CREATE TABLE "blocked_date" (
	"trainer_id" text NOT NULL,
	"date" date NOT NULL,
	CONSTRAINT "blocked_date_trainer_id_date_pk" PRIMARY KEY("trainer_id","date")
);
--> statement-breakpoint
ALTER TABLE "availability_rule" ADD CONSTRAINT "availability_rule_trainer_id_user_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocked_date" ADD CONSTRAINT "blocked_date_trainer_id_user_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "availability_rule_trainer_idx" ON "availability_rule" USING btree ("trainer_id");