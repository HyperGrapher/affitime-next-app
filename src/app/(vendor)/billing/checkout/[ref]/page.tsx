import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { FakeCheckout } from "@/features/payments/components/fake-checkout";
import { getPaymentForCheckout } from "@/features/payments/service";
import { signCallback, SIMULATED_FAILURES } from "@/providers/payment/simulated";
import { db } from "@/server/db";
import { requireRole } from "@/server/guards";
import { formatMoney } from "@/lib/money";
import { routes } from "@/lib/routes";
import { maskIban } from "@/domain/iban";
import { t } from "@/i18n";

export const metadata: Metadata = { title: "Güvenli ödeme" };

/** Simulated hosted checkout (what PayTR/iyzico would host). Its two buttons POST a *signed* callback to the real callback route. */
export default async function CheckoutPage({ params }: { params: Promise<{ ref: string }> }) {
  const viewer = await requireRole(["VENDOR"]);
  const { ref } = await params;
  const payment = await getPaymentForCheckout(db, ref, viewer.vendor!.id);
  if (!payment) notFound();
  if (payment.status !== "PENDING") redirect(routes.billing.result(ref));

  const total = payment.paidAmount.toFixed(2);
  const base = { merchant_oid: ref, total_amount: total, payment_type: "card", installment_count: String(payment.installments), test_mode: "1", return_to: routes.billing.result(ref) };
  const signed = {
    success: { ...base, status: "success", hash: signCallback(ref, "success", total) },
    failed: { ...base, status: "failed", hash: signCallback(ref, "failed", total) },
  };

  return (
    <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-5">
      <Card className="h-fit p-6 lg:col-span-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Sipariş özeti</p>
        <h1 className="mt-2 text-lg font-bold leading-snug">{payment.description}</h1>
        <dl className="mt-5 grid gap-2 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Tür</dt><dd>{t.paymentKind[payment.kind]}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Tutar</dt><dd className="tabular-nums">{formatMoney(payment.amount)}</dd></div>
          {payment.installments > 1 ? <div className="flex justify-between"><dt className="text-muted">Taksit</dt><dd>{payment.installments} × {formatMoney(payment.paidAmount / payment.installments)}</dd></div> : null}
          {payment.kind === "PAYOUT" ? <div className="flex justify-between"><dt className="text-muted">Alıcı IBAN</dt><dd className="font-mono text-xs">{maskIban(payment.iban)}</dd></div> : null}
          <div className="mt-2 flex justify-between border-t border-border pt-3 text-base font-bold"><dt>Çekilecek tutar</dt><dd className="tabular-nums">{formatMoney(payment.paidAmount)}</dd></div>
        </dl>
        <p className="mt-5 flex items-start gap-2 text-xs text-muted"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" /> Bu bir demo ödeme sayfasıdır. Gerçek kart bilgisi girmeyin; hiçbir ücret alınmaz.</p>
      </Card>
      <FakeCheckout className="lg:col-span-3" total={formatMoney(payment.paidAmount)} signed={signed} failures={Object.entries(SIMULATED_FAILURES).map(([code, msg]) => ({ code, msg }))} />
    </div>
  );
}
