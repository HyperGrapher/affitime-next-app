import type { MetadataRoute } from "next";
import { listPosts } from "@/features/content/blog";
import { env } from "@/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.NEXT_PUBLIC_APP_URL;
  const staticPages = ["", "/pricing", "/blog", "/contact", "/legal/terms", "/legal/privacy", "/legal/cookies", "/signin", "/signup"];
  return [...staticPages.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const })), ...listPosts().map((p) => ({ url: `${base}/blog/${p.slug}`, changeFrequency: "monthly" as const }))];
}
