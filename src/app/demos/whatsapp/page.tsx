import { desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DemoLinks } from "@/app/demos/_components/demo-links";
import { PremiumPaywall } from "@/components/premium-paywall";
import { getUserPremiumStatus } from "@/lib/auth/premium";
import { db } from "@/lib/db";
import { waMessages, waOrders } from "@/lib/db/schema";
import { getUser } from "@/lib/supabase/server";
import { BUSINESS_NAME } from "./catalog";
import { WhatsAppBot } from "./whatsapp-bot";

export const metadata: Metadata = {
  title: "WhatsApp AI Sales Bot · Demos",
};

export default async function WhatsAppPage() {
  const user = await getUser();
  if (!user) redirect("/login?from=/demos/whatsapp");

  const isPremium = await getUserPremiumStatus();

  const intro = (
    <>
      <h1 className="text-2xl font-bold tracking-tight">WhatsApp AI Sales Bot</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        A streaming AI assistant for {BUSINESS_NAME} that chats like WhatsApp, answers product
        questions, and places real orders with tool calls. Built on the AI SDK with an NVIDIA-hosted
        model, persisted per account with RLS.
      </p>
      <DemoLinks guide="/guides/build-whatsapp-ai-bot" skill="whatsapp" />
    </>
  );

  if (!isPremium) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-16">
        {intro}
        <div className="mt-6">
          <PremiumPaywall feature="demo" />
        </div>
      </main>
    );
  }

  const [history, orders] = await Promise.all([
    db
      .select()
      .from(waMessages)
      .where(eq(waMessages.userId, user.id))
      .orderBy(desc(waMessages.createdAt))
      .limit(100),
    db
      .select()
      .from(waOrders)
      .where(eq(waOrders.userId, user.id))
      .orderBy(desc(waOrders.createdAt)),
  ]);

  return (
    <main className="container mx-auto max-w-5xl px-4 py-16">
      {intro}
      <WhatsAppBot initialMessages={history.reverse()} initialOrders={orders} />
    </main>
  );
}
