-- profiles: one row per Supabase auth user, created automatically via trigger.
-- Only service_role may write is_premium (RLS blocks authenticated/anon writes).
CREATE TABLE "profiles" (
  "id" uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE NOT NULL,
  "email" text,
  "is_premium" boolean DEFAULT false NOT NULL,
  "premium_since" timestamp with time zone,
  "premium_source" varchar(32),
  "stripe_customer_id" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- RLS: enable immediately so no data is ever exposed without a policy.
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;

-- Users can only read their own profile row.
CREATE POLICY "profiles_select_own"
  ON "profiles"
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Auto-create a profile row whenever a new user signs up via any auth method.
CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
