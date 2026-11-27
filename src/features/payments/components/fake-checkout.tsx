"use client";

import { CreditCard, Lock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/input";

type Signed = Record<string, string>;

function brandOf(n: string) {
  const d = n.replace(/\D/g, "");
  return d.startsWith("4") ? "Visa" : /^5[1-5]/.test(d) ? "Mastercard" : d.startsWith("9792") ? "Troy" : d ? "Kart" : "";
}

/** Cosmetic card form for the simulated provider. The two submit buttons post pre-signed callbacks to /api/payments/callback. */
export function FakeCheckout({ total, signed, failures, className }: { total: string; signed: { success: Signed; failed: Signed }; failures: { code: string; msg: string }[]; className?: string }) {
  const [number, setNumber] = useState("4355 0843 5508 4358");
  const [failure, setFailure] = useState(failures[0]?.code ?? "CARD_DECLINED");
  const brand = brandOf(number);
  const hidden = (fields: Signed) => Object.entries(fields).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />);
  const cardFields = <><input type="hidden" name="card_brand" value={brand} /></>;

  return (
    <Card className={className}>
      <div className="p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold"><CreditCard className="size-5 text-primary" /> Kart bilgileri</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Kart numarası" htmlFor="cc-number" className="sm:col-span-2" hint={brand ? `Kart türü: ${brand}` : undefined}>
            <Input id="cc-number" inputMode="numeric" autoComplete="off" value={number} onChange={(e) => setNumber(e.target.value.replace(/[^\d ]/g, "").slice(0, 23))} />
          </Field>
          <Field label="Kart üzerindeki isim" htmlFor="cc-name" className="sm:col-span-2"><Input id="cc-name" autoComplete="off" defaultValue="PAYTR TEST" /></Field>
          <Field label="Son kullanma" htmlFor="cc-exp"><Input id="cc-exp" defaultValue="12 / 30" autoComplete="off" /></Field>
          <Field label="CVV" htmlFor="cc-cvv"><Input id="cc-cvv" defaultValue="000" autoComplete="off" /></Field>
        </div>

        <div className="mt-6 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
          <form method="post" action="/api/payments/callback">
            {hidden(signed.success)}{cardFields}
            <Button type="submit" size="lg" className="w-full"><Lock /> {total} öde (başarılı)</Button>
          </form>
          <form method="post" action="/api/payments/callback" className="grid gap-2">
            {hidden(signed.failed)}{cardFields}
            <input type="hidden" name="failed_reason_code" value={failure} />
            <input type="hidden" name="failed_reason_msg" value={failures.find((f) => f.code === failure)?.msg ?? ""} />
            <Button type="submit" size="lg" variant="outline" className="w-full">Başarısız say</Button>
            <Select aria-label="Başarısızlık nedeni" value={failure} onChange={(e) => setFailure(e.target.value)} className="h-9 text-xs">
              {failures.map((f) => <option key={f.code} value={f.code}>{f.msg}</option>)}
            </Select>
          </form>
        </div>
      </div>
    </Card>
  );
}
