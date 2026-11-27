import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPost, listPosts } from "@/features/content/blog";

export function generateStaticParams() {
  return listPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getPost((await params).slug);
  return post ? { title: post.meta.title, description: post.meta.description } : {};
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  return (
    <article className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <p className="text-sm text-muted">{post.meta.date}</p>
      <h1 className="mt-2 font-display text-h1 font-extrabold">{post.meta.title}</h1>
      <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert prose-a:text-primary" dangerouslySetInnerHTML={{ __html: post.html }} />
    </article>
  );
}
