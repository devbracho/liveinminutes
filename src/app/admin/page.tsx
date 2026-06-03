import { redirect } from "next/navigation";
import { isCurrentUserAdmin } from "@/lib/auth/roles";
import { GrantPremiumForm } from "./grant-premium-form";
import { SetRoleForm } from "./set-role-form";

export default async function AdminPage() {
  if (!(await isCurrentUserAdmin())) {
    redirect("/");
  }

  return (
    <main className="container mx-auto max-w-xl px-4 py-16">
      <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
      <p className="mt-1 text-muted-foreground">Manage member roles and premium access.</p>

      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">Set role</h2>
        <p className="mt-1 mb-4 text-sm text-muted-foreground">
          Assign <code className="font-mono text-xs">user</code>,{" "}
          <code className="font-mono text-xs">premium</code>, or{" "}
          <code className="font-mono text-xs">admin</code>. Premium and admin unlock all premium
          content.
        </p>
        <SetRoleForm />
      </section>

      <section className="mt-12 border-t border-border/40 pt-10">
        <h2 className="text-lg font-semibold tracking-tight">Grant timed premium</h2>
        <p className="mt-1 mb-4 text-sm text-muted-foreground">
          Flip the paid premium flag (used by the payment flow).
        </p>
        <GrantPremiumForm />
      </section>
    </main>
  );
}
