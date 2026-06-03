import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminUsers } from "@/lib/auth/admin-queries";
import { isCurrentUserAdmin } from "@/lib/auth/roles";
import { GrantPremiumForm } from "./grant-premium-form";
import { SetRoleForm } from "./set-role-form";
import { UserRow } from "./user-row";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  if (!(await isCurrentUserAdmin())) redirect("/");

  const users = await getAdminUsers();

  return (
    <main className="container mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
      <p className="mt-1 text-muted-foreground">
        {users.length} {users.length === 1 ? "user" : "users"} total.
      </p>

      {/* ── User table ── */}
      <section className="mt-8">
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  User
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Role
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Premium
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Access
                </th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    No users yet.
                  </td>
                </tr>
              ) : (
                users.map((user) => <UserRow key={user.id} user={user} />)
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Manual forms (by email) ── */}
      <section className="mt-12 grid gap-8 sm:grid-cols-2 border-t border-border/40 pt-10">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Set role by email</h2>
          <p className="mt-1 mb-4 text-sm text-muted-foreground">
            Assign <code className="font-mono text-xs">user</code>,{" "}
            <code className="font-mono text-xs">premium</code>, or{" "}
            <code className="font-mono text-xs">admin</code>.
          </p>
          <SetRoleForm />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Grant premium by email</h2>
          <p className="mt-1 mb-4 text-sm text-muted-foreground">
            Flip the paid premium flag for a specific email.
          </p>
          <GrantPremiumForm />
        </div>
      </section>
    </main>
  );
}
