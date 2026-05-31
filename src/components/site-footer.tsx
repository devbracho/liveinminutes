export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 py-8">
      <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 text-sm text-muted-foreground sm:flex-row">
        <p>Built with Next.js, Tailwind, shadcn/ui, Drizzle, and Supabase.</p>
        <p>&copy; {new Date().getFullYear()} LiveInMinutes</p>
      </div>
    </footer>
  );
}
