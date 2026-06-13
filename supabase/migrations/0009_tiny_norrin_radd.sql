CREATE TABLE "wa_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(16) NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wa_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"product" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"customer_name" text NOT NULL,
	"status" varchar(16) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "wa_messages" ADD CONSTRAINT "wa_messages_role_check" CHECK ("role" IN ('user', 'assistant'));--> statement-breakpoint
ALTER TABLE "wa_orders" ADD CONSTRAINT "wa_orders_status_check" CHECK ("status" IN ('pending', 'confirmed', 'cancelled'));--> statement-breakpoint
ALTER TABLE "wa_messages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "wa_orders" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "wa_messages_select_own"
	ON "wa_messages"
	FOR SELECT
	TO authenticated
	USING (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "wa_messages_insert_own"
	ON "wa_messages"
	FOR INSERT
	TO authenticated
	WITH CHECK (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "wa_messages_delete_own"
	ON "wa_messages"
	FOR DELETE
	TO authenticated
	USING (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "wa_orders_select_own"
	ON "wa_orders"
	FOR SELECT
	TO authenticated
	USING (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "wa_orders_insert_own"
	ON "wa_orders"
	FOR INSERT
	TO authenticated
	WITH CHECK (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "wa_orders_update_own"
	ON "wa_orders"
	FOR UPDATE
	TO authenticated
	USING (auth.uid() = user_id)
	WITH CHECK (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "wa_orders_delete_own"
	ON "wa_orders"
	FOR DELETE
	TO authenticated
	USING (auth.uid() = user_id);
