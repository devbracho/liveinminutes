import { desc } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PremiumPaywall } from "@/components/premium-paywall";
import { getUserPremiumStatus } from "@/lib/auth/premium";
import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { getUser } from "@/lib/supabase/server";
import { ChatRoom } from "./chat-room";

export const metadata: Metadata = {
  title: "Realtime Chat · Demos",
};

export default async function ChatPage() {
  const user = await getUser();
  if (!user) redirect("/login?from=/demos/chat");

  const isPremium = await getUserPremiumStatus();

  if (!isPremium) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-2xl font-bold tracking-tight">Realtime Chat</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Supabase Realtime channels + RLS. Messages update live across all tabs.
        </p>
        <Link
          href="/guides/build-realtime-chat"
          className="mt-3 mb-6 inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          See how to get live in minutes →
        </Link>
        <PremiumPaywall feature="demo" />
      </main>
    );
  }

  const initial = await db.select().from(messages).orderBy(desc(messages.createdAt)).limit(50);

  return (
    <main className="container mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-bold tracking-tight">Realtime Chat</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Supabase Realtime channels + RLS. Messages update live across all tabs.
      </p>
      <Link
        href="/guides/build-realtime-chat"
        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        See how to get live in minutes →
      </Link>
      <ChatRoom
        initialMessages={initial.reverse()}
        userId={user.id}
        username={user.email ?? "anon"}
      />
    </main>
  );
}
