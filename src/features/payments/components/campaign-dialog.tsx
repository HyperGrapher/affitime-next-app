"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Field, Select } from "@/components/ui/input";
import { CAMPAIGN_DURATIONS, INSTALLMENT_RATES, campaignPrice, withInstallments } from "@/domain/pricing";
import { formatMoney } from "@/lib/money";
import { routes } from "@/lib/routes";
import { errorMessage, notifyError } from "@/lib/toast";
import { useTRPC } from "@/lib/trpc/client";

export function CampaignDialog({ product, onClose }: { product: { id: string; title: string } | null; onClose: () => void }) {
  const trpc = useTRPC();
  const router = useRouter();
  const [days, setDays] = useState<number>(CAMPAIGN_DURATIONS[0]);
  const [installments, setInstallments] = useState(1);
  const [needsTax, setNeedsTax] = useState(false);
  const start = useMutation(trpc.payments.startCampaign.mutationOptions({
    onSuccess: (r) => router.push(r.checkoutUrl),
    onError: (e) => { if (e.message === "TAX_INFO_REQUIRED") setNeedsTax(true); else notifyError(errorMessage(e)); },
  }));
  const price = campaignPrice(days);
  const total = withInstallments(price, installments);

  return (
    <Dialog open={!!product} onOpenChange={(o) => { if (!o) { onClose(); setNeedsTax(false); } }}>
      <DialogContent title="Pazaryeri kampanyası" description={product ? `“${product.title}” ürününü partner pazaryerinde öne çıkarın.` : undefined}>
        <div className="grid gap-4">
          <Field label="Süre" htmlFor="c-days">
            <Select id="c-days" value={days} onChange={(e) => setDays(Number(e.target.value))}>{CAMPAIGN_DURATIONS.map((d) => <option key={d} value={d}>{d} gün — {formatMoney(campaignPrice(d))}</option>)}</Select>
          </Field>
          <Field label="Taksit" htmlFor="c-inst">
            <Select id="c-inst" value={installments} onChange={(e) => setInstallments(Number(e.target.value))}>
              {Object.keys(INSTALLMENT_RATES).map((n) => <option key={n} value={n}>{Number(n) === 1 ? "Tek çekim" : `${n} taksit`}</option>)}
            </Select>
          </Field>
          <div className="rounded-xl bg-surface-2 p-3 text-sm">
            <div className="flex justify-between"><span className="text-muted">Toplam</span><b>{formatMoney(total.total)}</b></div>
            {installments > 1 ? <div className="mt-1 flex justify-between"><span className="text-muted">Aylık</span><b>{formatMoney(total.monthly)} × {installments}</b></div> : null}
          </div>
          {needsTax ? <p role="alert" className="rounded-lg bg-warning-soft px-3 py-2 text-sm text-warning">Önce <Link className="font-bold underline" href={routes.billing.plans}>fatura bilgilerinizi</Link> kaydedin.</p> : null}
          <Button disabled={start.isPending || !product} onClick={() => product && start.mutate({ productId: product.id, days, installments })}>{start.isPending ? "Yönlendiriliyor…" : "Ödemeye geç"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
