import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CookiePolicy from "@/features/content/legal/cookies";
import PrivacyPolicy from "@/features/content/legal/privacy";
import UserAgreement from "@/features/content/legal/terms";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const DOCS = { terms: { title: "Kullanıcı Sözleşmesi", Component: UserAgreement }, privacy: { title: "Gizlilik Politikası", Component: PrivacyPolicy }, cookies: { title: "Çerez Politikası", Component: CookiePolicy } } as const;

export function generateStaticParams() {
  return Object.keys(DOCS).map((doc) => ({ doc }));
}

export async function generateMetadata({ params }: { params: Promise<{ doc: string }> }): Promise<Metadata> {
  const d = DOCS[(await params).doc as keyof typeof DOCS];
  return d ? { title: d.title } : {};
}

export default async function LegalPage({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  const entry = DOCS[doc as keyof typeof DOCS];
  if (!entry) notFound();
  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[14rem_1fr]">
      <nav aria-label="Yasal belgeler" className="grid h-fit gap-1">
        {Object.entries(DOCS).map(([key, d]) => <Link key={key} href={routes.legal(key)} aria-current={key === doc ? "page" : undefined} className={cn("rounded-lg px-3 py-2 text-sm font-medium", key === doc ? "bg-primary-soft text-primary" : "text-muted hover:bg-surface-2")}>{d.title}</Link>)}
      </nav>
      <article className="text-sm leading-relaxed text-muted [&_b]:text-foreground [&_h1]:font-display [&_h1]:text-2xl [&_h1]:font-extrabold [&_h1]:text-foreground [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_a]:text-primary [&_a]:underline"><entry.Component /></article>
    </div>
  );
}
