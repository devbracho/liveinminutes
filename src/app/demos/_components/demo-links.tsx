import Link from "next/link";

interface DemoLinksProps {
  guide: string;
  skill: string;
}

export function DemoLinks({ guide, skill }: DemoLinksProps) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-4">
      <Link
        href={guide}
        className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        See how to get live in minutes →
      </Link>
      <a
        href={`/skills/${skill}.md`}
        download="CLAUDE.md"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
      >
        Download as CLAUDE.md ↓
      </a>
    </div>
  );
}
