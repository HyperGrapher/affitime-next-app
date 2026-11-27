import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { getViewer } from "@/server/session";
import { homeForRole, routes } from "@/lib/routes";

export const metadata: Metadata = { title: "E-posta doğrulandı" };

export default async function VerifiedPage() {
  const viewer = await getViewer();
  return (
    <div className="text-center">
      <CheckCircle2 className="mx-auto size-14 text-success" />
      <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">E-postanız doğrulandı</h1>
      <p className="mt-2 text-muted">Hesabınız etkinleştirildi.</p>
      <ButtonLink href={viewer ? homeForRole(viewer.role) : routes.signin} size="lg" className="mt-8">Devam et</ButtonLink>
    </div>
  );
}
