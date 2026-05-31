import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const guidesDirectory = path.join(process.cwd(), "src", "content", "guides");

const frontmatterSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: z.string(),
  order: z.number().default(0),
  premium: z.boolean().default(false),
});

export type GuideFrontmatter = z.infer<typeof frontmatterSchema>;

export type GuideSummary = GuideFrontmatter & {
  slug: string;
};

export type GuideDetail = GuideSummary & {
  content: string;
};

function slugFromFilename(filename: string): string {
  return filename.replace(/\.mdx$/, "");
}

export async function getGuideSlugs(): Promise<string[]> {
  const entries = await readdir(guidesDirectory);
  return entries.filter((entry) => entry.endsWith(".mdx")).map(slugFromFilename);
}

export async function getGuide(slug: string): Promise<GuideDetail | null> {
  const filePath = path.join(guidesDirectory, `${slug}.mdx`);

  let raw: string;
  try {
    raw = await readFile(filePath, "utf8");
  } catch {
    return null;
  }

  const { data, content } = matter(raw);
  const frontmatter = frontmatterSchema.parse(data);

  return { slug, ...frontmatter, content };
}

export async function getAllGuides(): Promise<GuideSummary[]> {
  const slugs = await getGuideSlugs();
  const guides = await Promise.all(slugs.map((slug) => getGuide(slug)));

  return guides
    .filter((guide): guide is GuideDetail => guide !== null)
    .map(({ content: _content, ...summary }) => summary)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}
