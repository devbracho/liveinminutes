import { createClient } from "@/lib/supabase/server";

export async function getUserPremiumStatus(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data } = await supabase
    .from("profiles")
    .select("is_premium, premium_expires_at")
    .eq("id", user.id)
    .single();

  if (data?.is_premium !== true) return false;

  if (data.premium_expires_at && new Date(data.premium_expires_at) <= new Date()) {
    return false;
  }

  return true;
}

export type PremiumDetails = {
  isPremium: boolean;
  expiresAt: Date | null;
  isLifetime: boolean;
};

export async function getUserPremiumDetails(): Promise<PremiumDetails> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { isPremium: false, expiresAt: null, isLifetime: false };

  const { data } = await supabase
    .from("profiles")
    .select("is_premium, premium_expires_at")
    .eq("id", user.id)
    .single();

  if (data?.is_premium !== true) {
    return { isPremium: false, expiresAt: null, isLifetime: false };
  }

  const expiresAt = data.premium_expires_at ? new Date(data.premium_expires_at) : null;
  if (expiresAt && expiresAt <= new Date()) {
    return { isPremium: false, expiresAt, isLifetime: false };
  }

  return { isPremium: true, expiresAt, isLifetime: expiresAt === null };
}
