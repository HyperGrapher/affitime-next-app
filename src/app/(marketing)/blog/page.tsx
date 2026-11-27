import type { Metadata } from "next";
import Link from "next/link";
import { listPosts } from "@/features/content/blog";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Blog", description: "Affiliate pazarlama rehberleri ve Affitime haberleri." };

export default function BlogIndex() {
  const posts = listPosts();
  return (
    <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
      <h1 className="font-display text-h1 font-extrabold">Blog</h1>
      <p className="mt-2 text-muted">Rehberler, ipuçları ve ürün haberleri.</p>
      <ul className="mt-10 grid gap-5">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link href={routes.blogPost(p.slug)} className="block rounded-2xl border border-border bg-surface p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-lg">
              <p className="text-xs text-muted">{p.date}</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight">{p.title}</h2>
              {p.description ? <p className="mt-2 text-sm text-muted">{p.description}</p> : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
