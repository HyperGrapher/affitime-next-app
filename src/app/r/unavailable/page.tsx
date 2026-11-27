import { LinkIcon } from "lucide-react";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Bağlantı kullanılamıyor", robots: { index: false } };

const REASONS: Record<string, string> = {
  "not-found": "Bu takip linki bulunamadı.",
  inactive: "Bu kampanya şu anda aktif değil.",
  "plan-ended": "Markanın planı sona erdiği için bu kampanya geçici olarak kapalı.",
  "trial-ended": "Markanın deneme süresi sona erdiği için bu kampanya geçici olarak kapalı.",
};

export default async function Unavailable({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  const { reason } = await searchParams;
  return (
    <main id="main" className="grid min-h-dvh place-items-center px-4 text-center">
      <div className="max-w-md">
        <Logo className="mb-10" />
        <LinkIcon className="mx-auto size-12 text-muted" />
        <h1 className="mt-4 font-display text-2xl font-bold">Bağlantı kullanılamıyor</h1>
        <p className="mt-2 text-muted">{REASONS[reason ?? ""] ?? REASONS["not-found"]}</p>
        <ButtonLink href={routes.home} className="mt-8">Affitime ana sayfa</ButtonLink>
      </div>
    </main>
  );
}
