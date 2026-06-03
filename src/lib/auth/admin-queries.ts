import type { AdminUser } from "@/lib/auth/admin-types";
import type { Role } from "@/lib/auth/role-constants";
import { isCurrentUserAdmin } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";

function normalizeRole(value: unknown): Role {
  return value === "premium" || value === "admin" ? value : "user";
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  if (!(await isCurrentUserAdmin())) return [];

  const supabaseAdmin = createAdminClient();

  const [{ data: authData, error: authError }, { data: profiles }] = await Promise.all([
    supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
    supabaseAdmin.from("profiles").select("id, role, is_premium, premium_expires_at"),
  ]);

  if (authError) throw new Error(authError.message);

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
