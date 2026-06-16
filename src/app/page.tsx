import {
  ArrowRightIcon as ArrowRight,
  DatabaseIcon as Database,
  GaugeIcon as Gauge,
  GitBranchIcon as GitBranch,
  RocketIcon as Rocket,
  ShieldCheckIcon as ShieldCheck,
  SparkleIcon as Sparkles,
} from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Rocket,
    title: "Deploy in minutes",
    description: "Step-by-step guides that take you from empty folder to public URL.",
  },
  {
    icon: Sparkles,
    title: "Modern by default",
    description: "Next.js 16, React 19, Tailwind v4, shadcn/ui, Drizzle, Supabase.",
  },
  {
    icon: Database,
    title: "Real structured backend",
    description: "Type-safe Postgres with Drizzle, auth and storage with Supabase.",
  },
  {
    icon: ShieldCheck,
    title: "Best practices baked in",
    description: "Strict TypeScript, Biome, Zod validation, CI on every PR.",
  },
  {
    icon: Gauge,
    title: "Fast everywhere",
    description: "Server Components, edge-ready, Turbopack dev server.",
  },
  {
    icon: GitBranch,
    title: "CI / CD included",
    description: "GitHub Actions + Vercel preview URLs for every pull request.",
  },
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border/40">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,theme(colors.primary/0.15),transparent_60%)]"
        />
        <div className="container mx-auto flex flex-col items-center gap-8 px-4 py-24 text-center sm:py-32">
          <Badge variant="secondary" className="gap-1.5">
            <Sparkles className="size-3.5" />
            2026 gold-standard stack
          </Badge>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            Ship your app to the world,{" "}
            <span className="bg-gradient-to-r from-primary to-fuchsia-500 bg-clip-text text-transparent">
              in minutes
            </span>
            .
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Opinionated guides, real demos, and a working reference site that shows you how to
            build, deploy, and run a modern web app with best practices on day one.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/guides">
                Start a guide <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/demos">Browse demo apps</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything you need, nothing you don't
          </h2>
          <p className="mt-3 text-muted-foreground">
            A curated stack that real teams ship with, paired with tutorials you can finish today.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="transition-colors hover:border-primary/50">
              <CardHeader>
                <Icon className="size-6 text-primary" />
                <CardTitle className="mt-3">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
