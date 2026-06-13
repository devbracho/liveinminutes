import {
  CalendarClock,
  CheckSquare,
  Clock,
  FileText,
  LayoutDashboard,
  Link2,
  MessageCircle,
  MessageSquare,
  ShoppingCart,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Demo Apps",
  description: "Real, working example apps built with the LiveInMinutes reference stack.",
};

const demos = [
  {
    href: "/demos/tasks",
    guide: "/guides/build-task-tracker",
    icon: CheckSquare,
    title: "Task tracker",
    description: "CRUD with Server Actions, Drizzle, and optimistic UI. The classic starter.",
    stack: ["Server Actions", "Drizzle", "Zod"],
    live: true,
  },
  {
    href: "/demos/chat",
    guide: "/guides/build-realtime-chat",
    icon: MessageSquare,
    title: "Realtime chat",
    description: "Supabase Realtime channels with row-level security and presence.",
    stack: ["Supabase Realtime", "RLS", "Auth"],
    live: true,
    premium: true,
  },
  {
    href: "/demos/whatsapp",
    guide: "/guides/build-whatsapp-ai-bot",
    icon: MessageCircle,
    title: "WhatsApp AI sales bot",
    description:
      "A streaming AI assistant that chats like WhatsApp, answers product questions, and places orders with tool calls.",
    stack: ["AI SDK", "Tool calling", "RLS"],
    live: true,
    premium: true,
  },
  {
    href: "/demos/dashboard",
    guide: "/guides/build-analytics-dashboard",
    icon: LayoutDashboard,
    title: "Analytics dashboard",
    description: "Server Components streaming charts from Postgres with suspense boundaries.",
    stack: ["RSC", "Suspense", "Postgres"],
    live: true,
    premium: true,
  },
  {
    href: "/demos/store",
    guide: "/guides/build-storefront",
    icon: ShoppingCart,
    title: "Storefront",
    description: "Product catalog, cart in URL state, and checkout with validated payloads.",
    stack: ["URL state", "Zod", "next/image"],
    live: true,
  },
  {
    href: "/demos/timeclock",
    guide: "/guides/build-time-clock",
    icon: Clock,
    title: "Employee time clock",
    description: "Staff clock in and out of shifts. Per-user time entries secured with RLS.",
    stack: ["Server Actions", "Drizzle", "RLS"],
    live: true,
  },
  {
    href: "/demos/booking",
    guide: "/guides/build-appointment-booking",
    icon: CalendarClock,
    title: "Appointment booking",
    description: "Schedule, confirm, and cancel appointments with validated, per-user data.",
    stack: ["Server Actions", "Zod", "RLS"],
    live: true,
  },
  {
    href: "/demos/invoice",
    guide: "/guides/build-invoice-generator",
    icon: FileText,
    title: "Invoice generator",
    description: "Build line-item invoices with live totals and print to PDF. No backend needed.",
    stack: ["Client state", "Intl", "Print CSS"],
    live: true,
  },
  {
    href: "/demos/links",
    guide: "/guides/build-link-in-bio",
    icon: Link2,
    title: "Link-in-bio + QR",
    description: "A single page of links with a live preview and a scannable QR code.",
    stack: ["Client state", "next/image", "QR"],
    live: true,
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
          Each demo is a small but complete app you can read, run, and remix.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2">
        {demos.map(({ href, guide, icon: Icon, title, description, stack, premium }) => (
          <div key={title} className="group relative">
            <Card className="h-full transition-shadow group-hover:shadow-md flex flex-col">
              <Link href={href} className="absolute inset-0 rounded-[inherit]" aria-label={title} />
              <CardHeader className="flex-1">
                <div className="flex items-center justify-between">
                  <Icon className="size-6 text-primary" />
                  <div className="flex gap-1.5">
                    {premium && (
                      <Badge variant="secondary" className="text-xs">
                        Premium
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className="text-xs text-emerald-600 border-emerald-300"
                    >
                      Live
                    </Badge>
                  </div>
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
              <div className="px-6 pb-5">
                <Link
                  href={guide}
                  className="relative z-10 inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-4 hover:underline"
                >
                  Get live in minutes →
                </Link>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </main>
  );
}
