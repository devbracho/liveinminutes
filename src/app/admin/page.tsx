import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { GrantPremiumForm } from "./grant-premium-form";

const adminIds = (process.env.ADMIN_USER_IDS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export default async function AdminPage() {
  const user = await getUser();

  if (!user || !adminIds.includes(user.id)) {
    redirect("/");
  }

  return (
    <main className="container mx-auto max-w-xl px-4 py-16">
      <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
      <p className="mt-1 text-muted-foreground">Manually grant premium access to a user.</p>
      <div className="mt-8">
        <GrantPremiumForm />
      </div>
    </main>
  );
}
