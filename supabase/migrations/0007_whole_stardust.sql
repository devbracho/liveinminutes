CREATE TABLE "time_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"clock_in" timestamp with time zone DEFAULT now() NOT NULL,
	"clock_out" timestamp with time zone,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "time_entries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "time_entries_select_own"
	ON "time_entries"
	FOR SELECT
	TO authenticated
	USING (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "time_entries_insert_own"
	ON "time_entries"
	FOR INSERT
	TO authenticated
	WITH CHECK (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "time_entries_update_own"
	ON "time_entries"
	FOR UPDATE
	TO authenticated
	USING (auth.uid() = user_id)
	WITH CHECK (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "time_entries_delete_own"
	ON "time_entries"
	FOR DELETE
	TO authenticated
	USING (auth.uid() = user_id);
