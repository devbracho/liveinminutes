ALTER TABLE "profiles" ADD COLUMN "premium_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "stripe_customer_id";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "stripe_subscription_id";