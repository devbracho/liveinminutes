import { CheckSquare, LayoutDashboard, MessageSquare, ShoppingCart } from "lucide-react";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Demo Apps",
  description: "Real, working example apps built with the LiveInMinutes reference stack.",
};

const demos = [
  {
    icon: CheckSquare,
    title: "Task tracker",
    description: "CRUD with Server Actions, Drizzle, and optimistic UI. The classic starter.",
    stack: ["Server Actions", "Drizzle", "Zod"],
  },
  {
    icon: MessageSquare,
    title: "Realtime chat",
    description: "Supabase Realtime channels with row-level security and presence.",
    stack: ["Supabase Realtime", "RLS", "Auth"],
  },
  {
    icon: LayoutDashboard,
    title: "Analytics dashboard",
    description: "Server Components streaming charts from Postgres with suspense boundaries.",
    stack: ["RSC", "Suspense", "Postgres"],
  },
  {
    icon: ShoppingCart,
    title: "Storefront",
    description: "Product catalog, cart in URL state, and checkout with validated payloads.",
    stack: ["URL state", "Zod", "next/image"],
  },
];

export default function DemosPage() {
  return (
    <main className="container mx-auto px-4 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <Badge variant="secondary" className="gap-1.5">
          <LayoutDashboard className="size-3.5" />
          Demos
        </Badge>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          See the stack in action
        </h1>
        <p className="mt-3 text-muted-foreground">
          Each demo is a small but complete app you can read, run, and remix. More are on the way.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2">
        {demos.map(({ icon: Icon, title, description, stack }) => (
          <Card key={title} className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Icon className="size-6 text-primary" />
                <Badge variant="outline" className="text-xs">
                  Coming soon
                </Badge>
              </div>
              <CardTitle className="mt-3">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {stack.map((item) => (
                  <Badge key={item} variant="secondary" className="text-xs">
                    {item}
                  </Badge>
                ))}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </main>
  );
}
