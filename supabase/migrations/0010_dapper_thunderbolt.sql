CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"kind" varchar(16) NOT NULL,
	"plan" varchar(16),
	"order_id" text NOT NULL,
	"price_amount" integer NOT NULL,
	"status" varchar(32) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_paymentId_unique" UNIQUE("payment_id")
);
--> statement-breakpoint
CREATE TABLE "store_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"items" text[] NOT NULL,
	"total" integer NOT NULL,
	"status" varchar(16) DEFAULT 'pending' NOT NULL,
	"payment_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"paid_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_kind_check" CHECK ("kind" IN ('premium', 'store'));--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_plan_check" CHECK ("plan" IS NULL OR "plan" IN ('monthly', 'lifetime'));--> statement-breakpoint
ALTER TABLE "store_orders" ADD CONSTRAINT "store_orders_status_check" CHECK ("status" IN ('pending', 'paid', 'cancelled'));--> statement-breakpoint
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "store_orders" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "payments_select_own"
	ON "payments"
	FOR SELECT
	TO authenticated
	USING (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "store_orders_select_own"
	ON "store_orders"
	FOR SELECT
	TO authenticated
	USING (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "store_orders_insert_own"
	ON "store_orders"
	FOR INSERT
	TO authenticated
	WITH CHECK (auth.uid() = user_id);
