import { Rocket } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/actions";
import { getUser } from "@/lib/supabase/server";

export async function SiteHeader() {
  const user = await getUser();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Rocket className="size-5 text-primary" />
          <span>LiveInMinutes</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Button asChild variant="ghost" size="sm">
            <Link href="/guides">Guides</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/demos">Demos</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/resources">Resources</Link>
          </Button>
          {user ? (
            <>
              <span className="hidden px-2 text-muted-foreground sm:inline">{user.email}</span>
              <form action={signOut}>
                <Button type="submit" variant="ghost" size="sm">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
