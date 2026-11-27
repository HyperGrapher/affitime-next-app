"use client";

import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowRight, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Pager } from "@/components/ui/pager";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentStatusBadge } from "@/components/shared/badges";
import { maskIban } from "@/domain/iban";
import { formatDateTime } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { routes } from "@/lib/routes";
import { errorMessage, notifyError } from "@/lib/toast";
import { useTRPC } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { t } from "@/i18n";
import type { PaymentDTO } from "../service";

function History({ rows, role }: { rows: PaymentDTO[]; role: "VENDOR" | "PARTNER" | "ADMIN" }) {
  return (
    <ul className="divide-y divide-border">
      {rows.map((p) => (
        <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3.5 first:pt-0 last:pb-0">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{role === "PARTNER" ? `${p.vendor.brand} komisyon ödemesi` : p.description}</p>
            <p className="text-xs text-muted">{t.paymentKind[p.kind]} · {formatDateTime(p.completedAt ?? p.createdAt)}{p.installments > 1 ? ` · ${p.installments} taksit` : ""}{p.failureReason ? ` · ${p.failureReason}` : ""}{role === "ADMIN" ? ` · ${p.vendor.brand}` : ""}</p>
          </div>
          <PaymentStatusBadge status={p.status} />
          <span className="w-28 text-right text-sm font-semibold tabular-nums">{formatMoney(p.paidAmount)}</span>
        </li>
      ))}
    </ul>
  );
}

export function VendorPayments() {
  const trpc = useTRPC();
  const [page, setPage] = useState(1);
  const unpaid = useSuspenseQuery(trpc.payments.vendorUnpaid.queryOptions());
  const history = useQuery({ ...trpc.payments.vendorHistory.queryOptions({ page, pageSize: 8 }), placeholderData: (p) => p });
  const total = unpaid.data.reduce((a, b) => a + b.amount, 0);
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader><div><CardTitle>Ödenmesi gereken komisyonlar</CardTitle><CardDescription>Toplam {formatMoney(total)}</CardDescription></div></CardHeader>
        <CardContent>
          {unpaid.data.length === 0 ? <EmptyState icon={Wallet} title="Bekleyen ödeme yok" description="Partnerleriniz yeni geçerli tıklama getirdikçe burada görünür." /> : (
            <ul className="divide-y divide-border">
              {unpaid.data.map((u) => (
                <li key={u.partnerId} className="flex flex-wrap items-center gap-3 py-3.5 first:pt-0 last:pb-0">
                  <Avatar name={u.username} src={u.avatar} />
                  <div className="min-w-0 flex-1"><p className="truncate font-semibold">{u.username}</p><p className="text-xs text-muted">{u.clicks} geçerli tıklama{!u.hasIban ? " · IBAN girilmemiş" : ""}</p></div>
                  <span className="font-semibold tabular-nums">{formatMoney(u.amount)}</span>
                  <ButtonLink size="sm" href={routes.vendor.payPartner(u.partnerId)}>Öde <ArrowRight /></ButtonLink>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Ödeme geçmişi</CardTitle></CardHeader>
        <CardContent className="grid gap-4">
          {history.isPending ? <Skeleton className="h-32" /> : history.data && history.data.items.length > 0 ? <History rows={history.data.items} role="VENDOR" /> : <p className="text-sm text-muted">Henüz ödeme yok.</p>}
          {history.data ? <Pager page={history.data.page} pageCount={history.data.pageCount} total={history.data.total} onPage={setPage} /> : null}
        </CardContent>
      </Card>
    </div>
  );
}

export function PayoutConfirm({ partnerId }: { partnerId: string }) {
  const trpc = useTRPC();
  const router = useRouter();
  const unpaid = useSuspenseQuery(trpc.payments.vendorUnpaid.queryOptions());
  const entry = unpaid.data.find((u) => u.partnerId === partnerId);
  const start = useMutation(trpc.payments.startPayout.mutationOptions({ onSuccess: (r) => router.push(r.checkoutUrl), onError: (e) => notifyError(errorMessage(e)) }));
  if (!entry) return <EmptyState icon={Wallet} title="Bu partner için ödenecek komisyon yok" action={<ButtonLink href={routes.vendor.payments} variant="outline">Ödemelere dön</ButtonLink>} />;
  return (
    <Card className="mx-auto max-w-xl">
      <CardContent className="grid gap-5 p-6">
        <div className="flex items-center gap-3"><Avatar name={entry.username} src={entry.avatar} className="size-12" /><div><p className="text-lg font-bold">{entry.username}</p><p className="text-sm text-muted">{entry.clicks} geçerli tıklama</p></div></div>
        <div className="rounded-xl bg-surface-2 p-4 text-center"><p className="text-sm text-muted">Ödenecek komisyon</p><p className="text-4xl font-extrabold tracking-tight tabular-nums">{formatMoney(entry.amount)}</p></div>
        {!entry.hasIban ? <p role="alert" className="flex items-start gap-2 rounded-lg bg-warning-soft px-3 py-2 text-sm text-warning"><AlertCircle className="mt-0.5 size-4 shrink-0" /> Partner henüz IBAN bilgisi girmemiş. Ödeme yapılamaz.</p> : <p className="text-sm text-muted">Tutar, partnerin kayıtlı IBAN hesabına aktarılır. Ödeme tamamlanınca partnere bildirim ve e-posta gider.</p>}
        <div className="flex justify-end gap-2">
          <ButtonLink variant="outline" href={routes.vendor.payments}>Vazgeç</ButtonLink>
          <Button disabled={!entry.hasIban || start.isPending} onClick={() => start.mutate({ partnerId })}>{start.isPending ? "Hazırlanıyor…" : "Ödemeye geç"}</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function PartnerPayments() {
  const trpc = useTRPC();
  const [page, setPage] = useState(1);
  const awaiting = useSuspenseQuery(trpc.payments.partnerAwaiting.queryOptions());
  const history = useQuery({ ...trpc.payments.partnerHistory.queryOptions({ page, pageSize: 8 }), placeholderData: (p) => p });
  const settings = useQuery(trpc.account.partnerSettings.queryOptions());
  const total = awaiting.data.reduce((a, b) => a + b.amount, 0);
  return (
    <div className="grid gap-6">
      {settings.data && !settings.data.iban ? (
        <Card className="flex flex-wrap items-center justify-between gap-3 border-warning/40 bg-warning-soft p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-warning"><AlertCircle className="size-4" /> Ödeme alabilmek için IBAN bilgilerinizi ekleyin.</p>
          <ButtonLink size="sm" variant="outline" href={`${routes.partner.settings}#iban`}>IBAN ekle</ButtonLink>
        </Card>
      ) : null}
      <Card>
        <CardHeader><div><CardTitle>Bekleyen alacaklar</CardTitle><CardDescription>Toplam {formatMoney(total)}</CardDescription></div></CardHeader>
        <CardContent>
          {awaiting.data.length === 0 ? <p className="text-sm text-muted">Bekleyen alacağınız yok.</p> : (
            <ul className="divide-y divide-border">
              {awaiting.data.map((a) => (
                <li key={a.vendorId} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
                  <Avatar name={a.brand} src={a.logo} rounded="lg" />
                  <div className="min-w-0 flex-1"><p className="truncate font-semibold">{a.brand}</p><p className="text-xs text-muted">{a.clicks} geçerli tıklama</p></div>
                  <span className="font-semibold tabular-nums">{formatMoney(a.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Tahsil edilen ödemeler</CardTitle></CardHeader>
        <CardContent className="grid gap-4">
          {history.isPending ? <Skeleton className="h-32" /> : history.data && history.data.items.length > 0 ? <History rows={history.data.items} role="PARTNER" /> : <p className="text-sm text-muted">Henüz ödeme almadınız.</p>}
          {history.data ? <Pager page={history.data.page} pageCount={history.data.pageCount} total={history.data.total} onPage={setPage} /> : null}
        </CardContent>
      </Card>
      <Link href={routes.partner.settings} className={cn("text-sm text-muted", "hover:text-foreground")}>IBAN: {settings.data?.iban ? maskIban(settings.data.iban) : "girilmemiş"} · değiştir</Link>
    </div>
  );
}
export { History as PaymentHistory };
