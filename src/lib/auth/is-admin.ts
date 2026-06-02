import type { User } from "@supabase/supabase-js";

const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email: string | null | undefined): boolean {
  const normalized = email?.toLowerCase();
  return normalized !== undefined && adminEmails.includes(normalized);
}

export function isAdmin(user: User | null): boolean {
  return isAdminEmail(user?.email);
}
