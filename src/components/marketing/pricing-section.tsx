"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { PLAN_ORDER, PRICING_ANNUAL, PRICING_MONTHLY, TRIAL_DAYS, type PaidPlan } from "@/domain/pricing";
import { formatMoney } from "@/lib/money";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { t } from "@/i18n";

const FEATURES: Record<PaidPlan, string[]> = {
  BASIC: ["10 aktif ürün", "50 partner", "Tıklama ve kazanç paneli", "E-posta bildirimleri", "E-posta desteği"],
  PRO: ["50 aktif ürün", "500 partner", "Pazaryeri kampanyaları", "Mağaza API", "Öncelikli destek"],
  ULTIMATE: ["Sınırsız ürün ve partner", "Pazaryeri kampanyaları", "Mağaza API", "Özel hesap yöneticisi", "Özel entegrasyon desteği"],
};

export function PricingSection() {
  const [annual, setAnnual] = useState(true);
  return (
    <div>
      <div className="mb-10 flex justify-center">
        <div role="group" aria-label="Faturalandırma dönemi" className="inline-flex rounded-xl bg-surface-2 p-1">
          {[[false, "Aylık"], [true, "Yıllık"]].map(([val, label]) => (
            <button key={String(label)} aria-pressed={annual === val} onClick={() => setAnnual(val as boolean)} className={cn("rounded-lg px-5 py-2 text-sm font-semibold transition", annual === val ? "bg-surface shadow-sm" : "text-muted hover:text-foreground")}>
              {label as string}{val ? <Badge tone="success" className="ml-2">2 ay hediye</Badge> : null}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {PLAN_ORDER.map((plan) => {
          const popular = plan === "PRO";
          return (
            <div key={plan} className={cn("relative flex flex-col rounded-2xl border bg-surface p-7 shadow-card", popular ? "border-primary ring-1 ring-primary md:-translate-y-3" : "border-border")}>
              {popular ? <Badge tone="primary" className="absolute -top-3 left-7">En popüler</Badge> : null}
              <h3 className="text-lg font-bold">{t.plan[plan]}</h3>
              <p className="mt-4"><span className="font-display text-5xl font-extrabold tracking-tight tabular-nums">{formatMoney(annual ? PRICING_ANNUAL[plan] : PRICING_MONTHLY[plan], { compact: true })}</span><span className="text-muted"> / ay</span></p>
              <p className="mt-1 text-xs text-muted">{annual ? `Yıllık ${formatMoney(PRICING_ANNUAL[plan] * 12, { compact: true })} faturalandırılır` : "Aylık faturalandırılır"}</p>
              <ul className="my-7 grid flex-1 gap-3 text-sm">{FEATURES[plan].map((f) => <li key={f} className="flex gap-2.5"><Check className="mt-0.5 size-4 shrink-0 text-success" />{f}</li>)}</ul>
              <ButtonLink href={routes.signup("vendor")} variant={popular ? "primary" : "outline"} size="lg">{TRIAL_DAYS} gün ücretsiz dene</ButtonLink>
            </div>
          );
        })}
      </div>
      <p className="mt-8 text-center text-sm text-muted">Tüm fiyatlara KDV dahil değildir. Partner olarak katılmak <b className="text-foreground">tamamen ücretsizdir</b>.</p>
    </div>
  );
}
