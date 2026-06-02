import { isAdminEmail } from "@/lib/auth/is-admin";
import { type Role, ROLES } from "@/lib/auth/role-constants";
import { createClient } from "@/lib/supabase/server";

export { ROLES };
export type { Role };

export type ProfileAccess = {
  role: Role;
  isPaidPremiumActive: boolean;
  premiumExpiresAt: Date | null;
};

function normalizeRole(value: unknown): Role {
  return value === "premium" || value === "admin" ? value : "user";
}

export async function getProfileAccess(): Promise<ProfileAccess | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("role, is_premium, premium_expires_at")
    .eq("id", user.id)
    .single();

  let role = normalizeRole(data?.role);
  if (isAdminEmail(user.email)) role = "admin";

  const premiumExpiresAt = data?.premium_expires_at ? new Date(data.premium_expires_at) : null;
  const isPaidPremiumActive =
    data?.is_premium === true && (!premiumExpiresAt || premiumExpiresAt > new Date());

  return { role, isPaidPremiumActive, premiumExpiresAt };
}

export function hasPremiumAccess(access: ProfileAccess | null): boolean {
  if (!access) return false;
  return access.role === "premium" || access.role === "admin" || access.isPaidPremiumActive;
}

export async function getUserRole(): Promise<Role> {
  const access = await getProfileAccess();
  return access?.role ?? "user";
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  return (await getUserRole()) === "admin";
}
