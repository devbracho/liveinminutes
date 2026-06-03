"use server";

import { z } from "zod";
import { ROLES } from "@/lib/auth/role-constants";
import { isCurrentUserAdmin } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";

const grantSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

const roleSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  role: z.enum(ROLES),
});

export type AdminActionState = {
  error?: string;
  success?: string;
};

export async function grantPremium(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await isCurrentUserAdmin())) {
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

export async function setUserRole(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await isCurrentUserAdmin())) {
    return { error: "Not authorised." };
  }

  const parsed = roleSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabaseAdmin = createAdminClient();

  const { data: profile, error: lookupError } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("email", parsed.data.email)
    .single();

  if (lookupError || !profile) {
    return {
      error: `No account found for ${parsed.data.email}. The user must sign in at least once before a role can be assigned.`,
    };
  }

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ role: parsed.data.role })
    .eq("id", profile.id);

  if (error) {
    return { error: error.message };
  }

  return { success: `${parsed.data.email} is now ${parsed.data.role}.` };
}
