"use client";

import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Select } from "@/components/ui/input";
import { PLAN_ORDER, PRICING_ANNUAL, PRICING_MONTHLY, INSTALLMENT_RATES, planTotal, withInstallments, type PaidPlan } from "@/domain/pricing";
import { formatMoney } from "@/lib/money";
import { errorMessage, notifyError } from "@/lib/toast";
import { useTRPC } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { t } from "@/i18n";
import { TaxInfoForm } from "./tax-info-form";

const FEATURES: Record<PaidPlan, string[]> = {
  BASIC: ["10 aktif ürün", "50 partner", "Tıklama ve kazanç paneli", "E-posta desteği"],
  PRO: ["50 aktif ürün", "500 partner", "Pazaryeri kampanyaları", "Öncelikli destek", "Mağaza API"],
  ULTIMATE: ["Sınırsız ürün", "Sınırsız partner", "Pazaryeri kampanyaları", "Özel hesap yöneticisi", "Mağaza API"],
};

export function PlansView({ currentPlan }: { currentPlan: string | null }) {
  const trpc = useTRPC();
  const router = useRouter();
  const tax = useSuspenseQuery(trpc.payments.taxInfo.queryOptions());
  const [annual, setAnnual] = useState(true);
  const [installments, setInstallments] = useState(1);
  const [busy, setBusy] = useState<PaidPlan | null>(null);
  const start = useMutation(trpc.payments.startPlan.mutationOptions({
    onSuccess: (r) => router.push(r.checkoutUrl),
    onError: (e) => { setBusy(null); notifyError(errorMessage(e)); },
  }));

  return (
    <div className="grid gap-6">
      {!tax.data ? <TaxInfoForm /> : null}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div role="group" aria-label="Faturalandırma" className="inline-flex rounded-xl bg-surface-2 p-1">
          {[[false, "Aylık"], [true, "Yıllık"]].map(([val, label]) => (
            <button key={String(label)} aria-pressed={annual === val} onClick={() => setAnnual(val as boolean)} className={cn("rounded-lg px-4 py-2 text-sm font-semibold transition", annual === val ? "bg-surface shadow-sm" : "text-muted")}>
              {label as string}{val ? <Badge tone="success" className="ml-2">%{Math.round((1 - PRICING_ANNUAL.PRO / PRICING_MONTHLY.PRO) * 100)} indirim</Badge> : null}
            </button>
          ))}
        </div>
        <Field label="Taksit" htmlFor="installments" className="w-44">
          <Select id="installments" value={installments} onChange={(e) => setInstallments(Number(e.target.value))}>
            {Object.entries(INSTALLMENT_RATES).map(([n, r]) => <option key={n} value={n}>{Number(n) === 1 ? "Tek çekim" : `${n} taksit (+%${r})`}</option>)}
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {PLAN_ORDER.map((plan) => {
          const monthly = annual ? PRICING_ANNUAL[plan] : PRICING_MONTHLY[plan];
          const total = planTotal(plan, annual);
          const charge = withInstallments(total, installments);
          const popular = plan === "PRO";
          return (
            <Card key={plan} className={cn("relative flex flex-col p-6", popular && "border-primary ring-1 ring-primary")}>
              {popular ? <Badge tone="primary" className="absolute -top-3 left-6">En popüler</Badge> : null}
              <h3 className="text-lg font-bold">{t.plan[plan]}</h3>
              <p className="mt-3"><span className="text-4xl font-extrabold tracking-tight tabular-nums">{formatMoney(monthly, { compact: true })}</span><span className="text-muted"> / ay</span></p>
              <p className="mt-1 text-xs text-muted">{annual ? `Yıllık ${formatMoney(total)} faturalandırılır` : "Aylık faturalandırılır"}{installments > 1 ? ` · ${installments} × ${formatMoney(charge.monthly)}` : ""}</p>
              <ul className="my-6 grid flex-1 gap-2.5 text-sm">
                {FEATURES[plan].map((f) => <li key={f} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-success" />{f}</li>)}
              </ul>
              <Button variant={popular ? "primary" : "outline"} disabled={!tax.data || start.isPending} onClick={() => { setBusy(plan); start.mutate({ plan, annual, installments }); }}>
                {busy === plan ? "Yönlendiriliyor…" : currentPlan === plan ? "Planı yenile" : "Satın al"}
              </Button>
            </Card>
          );
        })}
      </div>
      <p className="text-center text-xs text-muted">Ödemeler demo ortamında simüle edilir; gerçek kart bilgisi alınmaz.</p>
    </div>
  );
}
