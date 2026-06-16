import { ArrowLeftIcon as ArrowLeft } from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { ComponentProps } from "react";
import { PremiumPaywall } from "@/components/premium-paywall";
import { Badge } from "@/components/ui/badge";
import { getUserPremiumStatus } from "@/lib/auth/premium";
import { getGuide, getGuideSlugs } from "@/lib/content/guides";

export async function generateStaticParams() {
  const slugs = await getGuideSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuide(slug);

  if (!guide) {
    return { title: "Guide not found" };
  }

  return { title: guide.title, description: guide.description };
}

const mdxComponents = {
  h2: (props: ComponentProps<"h2">) => (
    <h2 className="mt-10 mb-4 text-2xl font-semibold tracking-tight" {...props} />
  ),
  h3: (props: ComponentProps<"h3">) => (
    <h3 className="mt-8 mb-3 text-xl font-semibold tracking-tight" {...props} />
  ),
  p: (props: ComponentProps<"p">) => (
    <p className="my-4 leading-7 text-muted-foreground" {...props} />
  ),
  ul: (props: ComponentProps<"ul">) => (
    <ul className="my-4 ml-6 list-disc space-y-2 text-muted-foreground" {...props} />
  ),
  ol: (props: ComponentProps<"ol">) => (
    <ol className="my-4 ml-6 list-decimal space-y-2 text-muted-foreground" {...props} />
  ),
  a: (props: ComponentProps<"a">) => (
    <a className="font-medium text-primary underline underline-offset-4" {...props} />
  ),
  pre: (props: ComponentProps<"pre">) => (
    <pre
      className="my-6 overflow-x-auto rounded-lg bg-muted p-4 text-sm ring-1 ring-foreground/10"
      {...props}
    />
  ),
  code: (props: ComponentProps<"code">) => (
    <code
      className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm before:content-none after:content-none"
      {...props}
    />
  ),
};

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = await getGuide(slug);

  if (!guide) {
    notFound();
  }

  const isPremium = guide.premium ?? false;
  const hasAccess = !isPremium || (await getUserPremiumStatus());

  return (
    <main className="container mx-auto max-w-3xl px-4 py-16">
      <Link
        href="/guides"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All guides
      </Link>

      <header className="mt-6 border-b border-border/40 pb-8">
        <Badge variant="outline" className="text-xs">
          {guide.category}
        </Badge>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{guide.title}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{guide.description}</p>
      </header>

      <article className="mt-8">
        {hasAccess ? (
          <MDXRemote source={guide.content} components={mdxComponents} />
        ) : (
          <PremiumPaywall />
        )}
      </article>
    </main>
  );
}
