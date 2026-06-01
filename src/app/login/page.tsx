import { Rocket } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to LiveInMinutes to access guides, demos, and premium content.",
};

export default async function LoginPage() {
  const user = await getUser();
  if (user) {
    redirect("/");
  }

  return (
    <main className="container mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold">
          <Rocket className="size-5 text-primary" />
          <span>LiveInMinutes</span>
        </Link>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in with GitHub or a one-time magic link. No passwords to remember.
        </p>
      </div>

      <div className="mt-8">
        <LoginForm />
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        By continuing you agree to our terms. We only use your email to sign you in.
      </p>
    </main>
  );
}
