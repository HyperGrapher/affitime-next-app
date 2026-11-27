import { CheckCircle2, Clock, XCircle } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getPaymentForCheckout } from "@/features/payments/service";
import { db } from "@/server/db";
import { requireRole } from "@/server/guards";
import { formatDate, formatDateTime } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { routes } from "@/lib/routes";
import { t } from "@/i18n";

export const metadata: Metadata = { title: "Ödeme sonucu" };

export default async function ResultPage({ params }: { params: Promise<{ ref: string }> }) {
  const viewer = await requireRole(["VENDOR"]);
  const { ref } = await params;
  const p = await getPaymentForCheckout(db, ref, viewer.vendor!.id);
  if (!p) notFound();
  const ok = p.status === "SUCCEEDED";
  const pending = p.status === "PENDING";
  const Icon = ok ? CheckCircle2 : pending ? Clock : XCircle;
  const next = p.kind === "PLAN" ? routes.vendor.dashboard : p.kind === "CAMPAIGN" ? routes.vendor.products : routes.vendor.payments;
  return (
    <Card className="mx-auto mt-6 max-w-lg p-8 text-center">
      <Icon className={`mx-auto size-14 ${ok ? "text-success" : pending ? "text-warning" : "text-danger"}`} />
      <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">{ok ? "Ödemeniz alındı" : pending ? "Ödeme bekleniyor" : "Ödeme başarısız"}</h1>
      <p className="mt-2 text-muted">{p.description}</p>
      <dl className="mx-auto mt-6 grid max-w-xs gap-2 text-left text-sm">
        <div className="flex justify-between"><dt className="text-muted">Referans</dt><dd className="font-mono text-xs">{p.ref}</dd></div>
        <div className="flex justify-between"><dt className="text-muted">Tür</dt><dd>{t.paymentKind[p.kind]}</dd></div>
        <div className="flex justify-between"><dt className="text-muted">Tutar</dt><dd className="font-semibold tabular-nums">{formatMoney(p.paidAmount)}</dd></div>
        {p.installments > 1 ? <div className="flex justify-between"><dt className="text-muted">Taksit</dt><dd>{p.installments} × {formatMoney(p.paidAmount / p.installments)}</dd></div> : null}
        {p.cardBrand ? <div className="flex justify-between"><dt className="text-muted">Kart</dt><dd>{p.cardBrand}</dd></div> : null}
        {p.completedAt ? <div className="flex justify-between"><dt className="text-muted">Tarih</dt><dd>{formatDateTime(p.completedAt)}</dd></div> : null}
        {ok && p.validTill ? <div className="flex justify-between"><dt className="text-muted">Geçerlilik</dt><dd>{formatDate(p.validFrom)} – {formatDate(p.validTill)}</dd></div> : null}
        {!ok && !pending ? <div className="flex justify-between gap-4"><dt className="text-muted">Neden</dt><dd className="text-right text-danger">{p.failureReason ?? "Bilinmiyor"}</dd></div> : null}
      </dl>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {ok ? <ButtonLink href={next} size="lg">Devam et</ButtonLink> : <ButtonLink href={p.kind === "PLAN" ? routes.billing.plans : routes.vendor.payments} size="lg">Tekrar dene</ButtonLink>}
        <ButtonLink href={routes.vendor.payments} variant="outline" size="lg">Ödemelerim</ButtonLink>
      </div>
    </Card>
  );
}
