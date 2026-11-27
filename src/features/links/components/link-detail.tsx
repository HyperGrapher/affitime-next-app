"use client";

import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { ExternalLink, MousePointerClick, ShieldAlert, Wallet } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Avatar, ProductThumb } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/dialog";
import { StatCard } from "@/components/ui/stat-card";
import { ClicksChart } from "@/components/shared/charts";
import { CopyButton } from "@/components/shared/copy-button";
import { LinkStatusBadge, VisitFlagBadge } from "@/components/shared/badges";
import type { LinkAction } from "@/domain/link-status";
import { describeCommission } from "@/domain/commission";
import { formatDate, formatDateTime } from "@/lib/dates";
import { formatMoney, formatNumber } from "@/lib/money";
import { routes } from "@/lib/routes";
import { errorMessage, notifyError, notifySuccess } from "@/lib/toast";
import { useTRPC } from "@/lib/trpc/client";
import { t } from "@/i18n";
import { env as publicEnv } from "@/lib/public-env";

type Role = "VENDOR" | "PARTNER" | "ADMIN";
const DESTRUCTIVE: LinkAction[] = ["DENY", "CANCEL"];

export function LinkDetail({ id, role }: { id: string; role: Role }) {
  const trpc = useTRPC();
  const qc = useQueryClient();
  const { data } = useSuspenseQuery(trpc.links.detail.queryOptions({ id }));
  const [confirm, setConfirm] = useState<LinkAction | null>(null);

  const done = () => { setConfirm(null); void qc.invalidateQueries({ queryKey: trpc.links.pathKey() }); void qc.invalidateQueries({ queryKey: trpc.notifications.pathKey() }); void qc.invalidateQueries({ queryKey: trpc.dashboard.pathKey() }); };
  const vendorAct = useMutation(trpc.links.vendorAct.mutationOptions({ onSuccess: () => { notifySuccess("Link güncellendi"); done(); }, onError: (e) => { notifyError(errorMessage(e)); setConfirm(null); } }));
  const partnerCancel = useMutation(trpc.links.partnerCancel.mutationOptions({ onSuccess: () => { notifySuccess("Link iptal edildi"); done(); }, onError: (e) => notifyError(errorMessage(e)) }));
  const adminAct = useMutation(trpc.links.adminAct.mutationOptions({ onSuccess: () => { notifySuccess("Link güncellendi"); done(); }, onError: (e) => notifyError(errorMessage(e)) }));

  const { link, totals, series, recent, actions } = data;
  const run = (a: LinkAction) => {
    if (role === "VENDOR") vendorAct.mutate({ id, action: a as "APPROVE" | "DENY" | "PAUSE" | "RESUME" | "CANCEL" });
    else if (role === "PARTNER") partnerCancel.mutate({ id });
    else adminAct.mutate({ id, action: a as "PAUSE" | "CANCEL" });
  };
  const pending = vendorAct.isPending || partnerCancel.isPending || adminAct.isPending;
  const trackingUrl = `${publicEnv.appUrl}${routes.tracking(link.code)}`;
  const other = role === "PARTNER" ? { label: "Marka", name: link.vendor.brand, src: link.vendor.logo } : { label: "Partner", name: link.partner.username, src: link.partner.avatar };
  const visibleActions = actions.filter((a) => (role === "PARTNER" ? a === "CANCEL" : role === "ADMIN" ? a === "PAUSE" || a === "CANCEL" : true));

  return (
    <div className="grid gap-6">
      <Card className="p-5">
        <div className="flex flex-wrap items-start gap-4">
          <ProductThumb title={link.product.title} src={link.product.image} className="size-16" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-bold tracking-tight">{link.product.title}</h2><LinkStatusBadge status={link.status} /></div>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted"><Avatar name={other.name} src={other.src} className="size-5 text-[9px]" /> {other.label}: <b className="text-foreground">{other.name}</b> · {link.product.category.name} · {formatDate(link.createdAt)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {visibleActions.map((a) => (
              <Button key={a} size="sm" variant={DESTRUCTIVE.includes(a) ? "outline" : "primary"} disabled={pending} onClick={() => (DESTRUCTIVE.includes(a) ? setConfirm(a) : run(a))}>{t.linkAction[a]}</Button>
            ))}
          </div>
        </div>
        {link.status === "CONFIRMED" && role !== "VENDOR" ? (
          <div className="mt-5 flex flex-wrap items-center gap-2 rounded-xl bg-surface-2 p-3">
            <code className="min-w-0 flex-1 truncate font-mono text-sm" title={trackingUrl}>{trackingUrl}</code>
            <CopyButton value={trackingUrl} label="Linki kopyala" />
            <Link href={routes.tracking(link.code)} target="_blank" className="inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-border" aria-label="Linki aç"><ExternalLink className="size-4" /></Link>
          </div>
        ) : null}
        {role !== "VENDOR" && link.status === "AWAITING" ? <p className="mt-4 text-sm text-muted">Başvurunuz marka tarafından inceleniyor. Onaylandığında takip linkiniz burada görünür.</p> : null}
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tıklama" value={formatNumber(totals.clicks)} icon={MousePointerClick} hint={`${formatNumber(totals.unique)} tekil`} />
        <StatCard label={role === "PARTNER" ? "Bekleyen kazanç" : "Ödenecek komisyon"} value={formatMoney(totals.unpaid)} icon={Wallet} tone="accent" />
        <StatCard label="Ödenen" value={formatMoney(totals.paid)} icon={Wallet} tone="success" />
        <StatCard label="Şüpheli tıklama" value={formatNumber(totals.flagged)} icon={ShieldAlert} tone="warning" hint="Komisyon dışı" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2"><CardHeader><div><CardTitle>Trafik</CardTitle><CardDescription>Son 30 gün</CardDescription></div></CardHeader><CardContent><ClicksChart data={series} /></CardContent></Card>
        <Card>
          <CardHeader><CardTitle>Kampanya koşulları</CardTitle></CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm">
              {[["Tıklama komisyonu", describeCommission(link.clickCommission, link.clickCommissionType)], ["Satış komisyonu", describeCommission(link.saleCommission, link.saleCommissionType)], ["Ürün fiyatı", formatMoney(link.productPrice)], ["Çerez süresi", `${link.cookieDays} gün`]].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3"><dt className="text-muted">{k}</dt><dd className="font-semibold tabular-nums">{v}</dd></div>
              ))}
            </dl>
            <p className="mt-4 text-xs text-muted">Koşullar başvuru anında sabitlenir; ürün sonradan güncellense de bu link için değişmez.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Son tıklamalar</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          {recent.length === 0 ? <p className="text-sm text-muted">Henüz tıklama yok.</p> : (
            <table className="w-full min-w-[32rem] text-sm">
              <thead><tr className="text-left text-xs uppercase tracking-wide text-muted"><th className="pb-2 font-semibold">Zaman</th><th className="pb-2 font-semibold">Ülke</th><th className="pb-2 font-semibold">Tarayıcı</th><th className="pb-2 font-semibold">Durum</th><th className="pb-2 text-right font-semibold">Komisyon</th></tr></thead>
              <tbody className="divide-y divide-border">
                {recent.map((v) => (
                  <tr key={v.id}>
                    <td className="py-2.5">{formatDateTime(v.createdAt)}</td>
                    <td className="py-2.5">{v.country}</td>
                    <td className="py-2.5 text-muted">{[v.browser, v.os].filter(Boolean).join(" · ") || "–"}</td>
                    <td className="py-2.5">{v.flag ? <VisitFlagBadge flag={v.flag} /> : v.isUnique ? <Badge tone="success">Tekil</Badge> : <Badge>Tekrar</Badge>}</td>
                    <td className="py-2.5 text-right font-medium tabular-nums">{v.billable ? formatMoney(v.commission) : "–"}{v.payoutId ? <span className="ml-1 text-xs text-success">ödendi</span> : null}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)} destructive pending={pending} title={confirm ? `${t.linkAction[confirm]}?` : ""} description="Bu işlem partner/marka tarafına bildirilir." confirmLabel={confirm ? t.linkAction[confirm] : ""} onConfirm={() => confirm && run(confirm)} />
    </div>
  );
}
