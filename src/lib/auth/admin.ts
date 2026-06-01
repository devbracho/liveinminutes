"use server";

import { z } from "zod";
import { isAdmin } from "@/lib/auth/is-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/supabase/server";

const grantSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

export type AdminActionState = {
  error?: string;
  success?: string;
};

export async function grantPremium(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const caller = await getUser();
  if (!isAdmin(caller)) {
    return { error: "Not authorised." };
  }

  const parsed = grantSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid email." };
  }

  const supabaseAdmin = createAdminClient();

  const { data: profile, error: lookupError } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("email", parsed.data.email)
    .single();

  if (lookupError || !profile) {
    return {
      error: `No account found for ${parsed.data.email}. The user must sign in at least once before premium can be granted.`,
    };
  }

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      is_premium: true,
      premium_since: new Date().toISOString(),
      premium_source: "manual",
    })
    .eq("id", profile.id);

  if (error) {
    return { error: error.message };
  }

  return { success: `Premium granted to ${parsed.data.email}.` };
}
