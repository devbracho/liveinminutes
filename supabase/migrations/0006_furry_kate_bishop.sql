ALTER TABLE "profiles" ADD COLUMN "role" varchar(16) DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_role_check" CHECK ("role" IN ('user', 'premium', 'admin'));--> statement-breakpoint
UPDATE "profiles" SET "role" = 'premium' WHERE "is_premium" = true AND "role" = 'user';