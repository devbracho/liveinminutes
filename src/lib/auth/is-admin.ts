import type { User } from "@supabase/supabase-js";

const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export function isAdmin(user: User | null): boolean {
  const email = user?.email?.toLowerCase();
  return email !== undefined && adminEmails.includes(email);
}
