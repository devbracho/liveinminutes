CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"duration_minutes" integer DEFAULT 30 NOT NULL,
	"status" varchar(16) DEFAULT 'confirmed' NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_status_check" CHECK ("status" IN ('confirmed', 'cancelled'));--> statement-breakpoint
ALTER TABLE "bookings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "bookings_select_own"
	ON "bookings"
	FOR SELECT
	TO authenticated
	USING (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "bookings_insert_own"
	ON "bookings"
	FOR INSERT
	TO authenticated
	WITH CHECK (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "bookings_update_own"
	ON "bookings"
	FOR UPDATE
	TO authenticated
	USING (auth.uid() = user_id)
	WITH CHECK (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "bookings_delete_own"
	ON "bookings"
	FOR DELETE
	TO authenticated
	USING (auth.uid() = user_id);
