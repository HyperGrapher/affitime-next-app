import { MailCheck } from "lucide-react";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { getViewer } from "@/server/session";
import { homeForRole, routes } from "@/lib/routes";

export const metadata: Metadata = { title: "E-posta değişikliği" };

export default async function ChangeEmailPage() {
  const viewer = await getViewer();
  return (
    <div className="text-center">
      <MailCheck className="mx-auto size-14 text-primary" />
      <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">Değişiklik onaylandı</h1>
      <p className="mt-2 text-muted">E-posta adresiniz güncellendi.</p>
      <ButtonLink href={viewer ? homeForRole(viewer.role) : routes.signin} size="lg" className="mt-8">Devam et</ButtonLink>
    </div>
  );
}
