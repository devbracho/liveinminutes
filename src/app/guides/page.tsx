import { ArrowRight, BookOpen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllGuides } from "@/lib/content/guides";

export const metadata: Metadata = {
  title: "Guides",
  description: "Step-by-step guides that take you from an empty folder to a live URL.",
};

export default async function GuidesPage() {
  const guides = await getAllGuides();

  return (
    <main className="container mx-auto px-4 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <Badge variant="secondary" className="gap-1.5">
          <BookOpen className="size-3.5" />
          Guides
        </Badge>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          From empty folder to live URL
        </h1>
        <p className="mt-3 text-muted-foreground">
          Opinionated, copy-pasteable walkthroughs. Each one finishes in minutes and leaves you with
          a real, deployed app.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2">
        {guides.map((guide) => (
          <Link key={guide.slug} href={`/guides/${guide.slug}`} className="group">
            <Card className="h-full transition hover:ring-2 hover:ring-primary/40">
              <CardHeader>
                <Badge variant="outline" className="w-fit text-xs">
                  {guide.category}
                </Badge>
                <CardTitle className="mt-3 flex items-center justify-between gap-2">
                  {guide.title}
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </CardTitle>
                <CardDescription>{guide.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
