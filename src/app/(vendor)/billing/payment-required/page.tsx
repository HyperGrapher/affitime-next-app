import { LockKeyhole } from "lucide-react";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/dates";
import { routes } from "@/lib/routes";
import { requireRole } from "@/server/guards";

export const metadata: Metadata = { title: "Ödeme gerekli" };

export default async function Page() {
  const viewer = await requireRole(["VENDOR"]);
  const plan = viewer.vendor?.plan;
  const trialEnded = plan?.state === "TRIAL_ENDED";
  const endedAt = plan && (plan.state === "TRIAL_ENDED" || plan.state === "PLAN_ENDED") ? plan.endedAt : null;
  return (
    <Card className="mx-auto mt-6 max-w-xl p-8 text-center">
      <LockKeyhole className="mx-auto size-12 text-accent" />
      <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">{trialEnded ? "Deneme süreniz sona erdi" : plan?.state === "PLAN_ENDED" ? "Planınızın süresi doldu" : "Aktif planınız var"}</h1>
      <p className="mt-2 text-muted">{endedAt ? `${formatDate(endedAt)} tarihinde sona erdi. ` : ""}Partner linkleriniz geçici olarak durduruldu; planı yenilediğinizde otomatik olarak yeniden açılır. Verileriniz silinmez.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <ButtonLink href={routes.billing.plans} size="lg">Plan seç</ButtonLink>
        <ButtonLink href={routes.vendor.payments} variant="outline" size="lg">Ödemelerim</ButtonLink>
      </div>
    </Card>
  );
}
