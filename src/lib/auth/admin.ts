"use server";

import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { getUser } from "@/lib/supabase/server";

const adminIds = (process.env.ADMIN_USER_IDS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function isAdmin(userId: string): boolean {
  return adminIds.includes(userId);
}

const grantSchema = z.object({
  userId: z.string().uuid(),
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
  if (!caller || !isAdmin(caller.id)) {
    return { error: "Not authorised." };
  }

  const parsed = grantSchema.safeParse({ userId: formData.get("userId") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid user ID." };
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    { auth: { persistSession: false } },
  );

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      is_premium: true,
      premium_since: new Date().toISOString(),
      premium_source: "manual",
    })
    .eq("id", parsed.data.userId);

  if (error) {
    return { error: error.message };
  }

  return { success: `Premium granted to ${parsed.data.userId}.` };
}
