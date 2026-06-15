import {
  ArrowSquareOutIcon as ExternalLink,
  BooksIcon as Library,
} from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Resources",
  description: "Curated documentation and references for the LiveInMinutes stack.",
};

const resourceGroups = [
  {
    heading: "Framework & UI",
    items: [
      {
        name: "Next.js docs",
        href: "https://nextjs.org/docs",
        note: "App Router, Server Components, caching.",
      },
      {
        name: "React docs",
        href: "https://react.dev",
        note: "Hooks, Server Components, and reference.",
      },
      {
        name: "Tailwind CSS",
        href: "https://tailwindcss.com/docs",
        note: "Utility-first styling, v4.",
      },
      {
        name: "shadcn/ui",
        href: "https://ui.shadcn.com",
        note: "Accessible components you copy into your app.",
      },
    ],
  },
  {
    heading: "Data & backend",
    items: [
      {
        name: "Supabase docs",
        href: "https://supabase.com/docs",
        note: "Postgres, auth, storage, realtime.",
      },
      {
        name: "Drizzle ORM",
        href: "https://orm.drizzle.team",
        note: "Type-safe SQL with a schema-first API.",
      },
      { name: "Zod", href: "https://zod.dev", note: "Schema validation for every boundary." },
    ],
  },
  {
    heading: "Tooling & deploy",
    items: [
      {
        name: "Vercel docs",
        href: "https://vercel.com/docs",
        note: "Deploys, previews, env vars, edge.",
      },
      { name: "Biome", href: "https://biomejs.dev", note: "One fast linter and formatter." },
      { name: "pnpm", href: "https://pnpm.io", note: "Fast, disk-efficient package manager." },
    ],
  },
];

export default function ResourcesPage() {
  return (
    <main className="container mx-auto px-4 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <Badge variant="secondary" className="gap-1.5">
          <Library className="size-3.5" />
          Resources
        </Badge>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          The docs we actually use
        </h1>
        <p className="mt-3 text-muted-foreground">
          Official references for every tool in the stack. Bookmark them, then forget them.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-4xl space-y-10">
        {resourceGroups.map((group) => (
          <section key={group.heading}>
            <h2 className="text-lg font-semibold tracking-tight">{group.heading}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <Card className="h-full transition hover:ring-2 hover:ring-primary/40">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between gap-2">
                        {item.name}
                        <ExternalLink className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
                      </CardTitle>
                      <CardDescription>{item.note}</CardDescription>
                    </CardHeader>
                  </Card>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
