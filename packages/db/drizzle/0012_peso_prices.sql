ALTER TABLE "trainer_profile" DROP CONSTRAINT "trainer_price_30_range";--> statement-breakpoint
ALTER TABLE "trainer_profile" DROP CONSTRAINT "trainer_price_60_range";--> statement-breakpoint
-- Prices move from US cents to PHP centavos at about 40 pesos to the dollar.
UPDATE "trainer_profile" SET "price_30_cents" = least(greatest("price_30_cents" * 40, 30000), 1000000), "price_60_cents" = least(greatest("price_60_cents" * 40, 30000), 1000000);--> statement-breakpoint
UPDATE "booking" SET "price_cents" = "price_cents" * 40, "platform_fee_cents" = "platform_fee_cents" * 40, "trainer_payout_cents" = "trainer_payout_cents" * 40, "refund_cents" = "refund_cents" * 40;--> statement-breakpoint
ALTER TABLE "trainer_profile" ADD CONSTRAINT "trainer_price_30_range" CHECK ("trainer_profile"."price_30_cents" between 30000 and 1000000);--> statement-breakpoint
ALTER TABLE "trainer_profile" ADD CONSTRAINT "trainer_price_60_range" CHECK ("trainer_profile"."price_60_cents" between 30000 and 1000000);