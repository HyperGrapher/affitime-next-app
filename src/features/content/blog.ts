import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";

// html:false → raw HTML in markdown is escaped (posts are trusted repo files, but keep the renderer safe by default).
const md = new MarkdownIt({ html: false, linkify: true, typographer: true });
const DIR = path.join(process.cwd(), "blogs");

export interface PostMeta { slug: string; title: string; date: string; sortKey: string; cover: string | null; description: string; tags: string[] }

function read(slug: string) {
  const raw = fs.readFileSync(path.join(DIR, `${slug}.md`), "utf8");
  const { data, content } = matter(raw);
  const meta: PostMeta = {
    slug,
    title: String(data.title ?? slug),
    date: String(data.date ?? ""),
    sortKey: slug,
    cover: (data.cover_img as string | undefined) ?? null,
    description: String(data.metaDesc ?? ""),
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
  };
  return { meta, content };
}

export function listPosts(): PostMeta[] {
  if (!fs.existsSync(DIR)) return [];
  return fs.readdirSync(DIR).filter((f) => f.endsWith(".md")).map((f) => read(f.replace(/\.md$/, "")).meta).sort((a, b) => b.sortKey.localeCompare(a.sortKey));
}

export function getPost(slug: string) {
  if (!/^[\w-]+$/.test(slug) || !fs.existsSync(path.join(DIR, `${slug}.md`))) return null;
  const { meta, content } = read(slug);
  return { meta, html: md.render(content) };
}
