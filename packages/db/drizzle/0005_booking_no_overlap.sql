-- The database itself refuses double bookings, so two people racing for the same slot can't both win.
-- Only live bookings count; cancelled and expired ones free the time again.
CREATE EXTENSION IF NOT EXISTS btree_gist;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_trainer_no_overlap"
  EXCLUDE USING gist ("trainer_id" WITH =, tstzrange("starts_at", "ends_at") WITH &&)
  WHERE ("status" IN ('held', 'confirmed'));--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_owner_no_overlap"
  EXCLUDE USING gist ("owner_id" WITH =, tstzrange("starts_at", "ends_at") WITH &&)
  WHERE ("status" IN ('held', 'confirmed'));
