"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { type AdminActionState, type AdminUser } from "@/lib/auth/admin-types";
import { ROLES } from "@/lib/auth/role-constants";
import type { Role } from "@/lib/auth/role-constants";
import { isCurrentUserAdmin } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";

function normalizeRole(value: unknown): Role {
  return value === "premium" || value === "admin" ? value : "user";
}

// ─── Read ────────────────────────────────────────────────────────────────────

export async function getAdminUsers(): Promise<AdminUser[]> {
  if (!(await isCurrentUserAdmin())) return [];

  const supabaseAdmin = createAdminClient();

  const [{ data: authData }, { data: profiles }] = await Promise.all([
    supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
    supabaseAdmin.from("profiles").select("id, role, is_premium, premium_expires_at"),
  ]);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [
      p.id,
      {
        role: normalizeRole(p.role),
        isPremium:
          p.is_premium === true &&
          (!p.premium_expires_at || new Date(p.premium_expires_at) > new Date()),
      },
    ]),
  );

  return (authData?.users ?? []).map((u) => {
    const p = profileMap.get(u.id);
    return {
      id: u.id,
      email: u.email ?? "",
      createdAt: new Date(u.created_at),
      banned: !!u.banned_until && new Date(u.banned_until) > new Date(),
      role: p?.role ?? "user",
      isPremium: p?.isPremium ?? false,
    };
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function findAuthUserByEmail(email: string) {
  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;
  return data.users.find((u) => u.email === email) ?? null;
}

async function ensureProfile(id: string, email: string) {
  const supabaseAdmin = createAdminClient();
  await supabaseAdmin
    .from("profiles")
    .upsert({ id, email }, { onConflict: "id", ignoreDuplicates: true });
}

// ─── By email (forms) ─────────────────────────────────────────────────────────

const emailSchema = z.object({ email: z.string().email("Enter a valid email address.") });
const roleSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  role: z.enum(ROLES),
});

export async function grantPremium(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await isCurrentUserAdmin())) return { error: "Not authorised." };

  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid email." };

  const authUser = await findAuthUserByEmail(parsed.data.email);
  if (!authUser) {
    return {
      error: `No account found for ${parsed.data.email}. The user must sign in at least once.`,
    };
  }

  await ensureProfile(authUser.id, authUser.email ?? parsed.data.email);

  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ is_premium: true, premium_since: new Date().toISOString(), premium_source: "manual" })
    .eq("id", authUser.id);

  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { success: `Premium granted to ${parsed.data.email}.` };
}

export async function setUserRole(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await isCurrentUserAdmin())) return { error: "Not authorised." };

  const parsed = roleSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const authUser = await findAuthUserByEmail(parsed.data.email);
  if (!authUser) {
    return {
      error: `No account found for ${parsed.data.email}. The user must sign in at least once.`,
    };
  }

  await ensureProfile(authUser.id, authUser.email ?? parsed.data.email);

  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ role: parsed.data.role })
    .eq("id", authUser.id);

  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { success: `${parsed.data.email} is now ${parsed.data.role}.` };
}

// ─── By ID (table row actions) ────────────────────────────────────────────────

export async function setUserRoleById(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await isCurrentUserAdmin())) return { error: "Not authorised." };

  const userId = z.string().uuid().safeParse(formData.get("userId"));
  const role = z.enum(ROLES).safeParse(formData.get("role"));
  if (!userId.success || !role.success) return { error: "Invalid input." };

  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ role: role.data })
    .eq("id", userId.data);

  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { success: "Role updated." };
}

export async function setPremiumById(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await isCurrentUserAdmin())) return { error: "Not authorised." };

  const userId = z.string().uuid().safeParse(formData.get("userId"));
  const grant = formData.get("grant") === "true";
  if (!userId.success) return { error: "Invalid user ID." };

  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin
    .from("profiles")
    .update(
      grant
        ? { is_premium: true, premium_since: new Date().toISOString(), premium_source: "manual" }
        : { is_premium: false },
    )
    .eq("id", userId.data);

  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { success: grant ? "Premium granted." : "Premium revoked." };
}

export async function setUserBannedById(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await isCurrentUserAdmin())) return { error: "Not authorised." };

  const userId = z.string().uuid().safeParse(formData.get("userId"));
  const ban = formData.get("ban") === "true";
  if (!userId.success) return { error: "Invalid user ID." };

  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId.data, {
    ban_duration: ban ? "87600h" : "none",
  });

  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { success: ban ? "User disabled." : "User enabled." };
}
