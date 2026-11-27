"use client";

import { AlertTriangle, BadgeDollarSign, Eye, Link2, MousePointerClick, Package, ShieldAlert, Users, Wallet } from "lucide-react";
import Link from "next/link";
import { Avatar, ProductThumb } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { ClicksChart, EarningsChart } from "@/components/shared/charts";
import { PlanBadge } from "@/components/shared/badges";
import type { PlanStatus } from "@/domain/plan";
import type { DayPoint, VisitTotals } from "@/features/visits/stats";
import { daysUntil, formatDate } from "@/lib/dates";
import { formatMoney, formatNumber } from "@/lib/money";
import { routes } from "@/lib/routes";

interface TopProduct { productId: string; title: string; image: string | null; clicks: number; earnings: number }
interface Countries { country: string; clicks: number }
interface LinkCounts { all: number; pending: number; live: number; closed: number }

const countryName = (() => {
  try { const dn = new Intl.DisplayNames(["tr"], { type: "region" }); return (c: string) => (c === "-" ? "Bilinmiyor" : (dn.of(c) ?? c)); } catch { return (c: string) => c; }
})();

function ChartSection({ series, title, money }: { series: DayPoint[]; title: string; money: boolean }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader><div><CardTitle>{title}</CardTitle><CardDescription>Son 30 gün</CardDescription></div></CardHeader>
        <CardContent><ClicksChart data={series} /></CardContent>
      </Card>
      <Card>
        <CardHeader><div><CardTitle>{money ? "Kazanç" : "Komisyon yükümlülüğü"}</CardTitle><CardDescription>Günlük komisyon</CardDescription></div></CardHeader>
        <CardContent><EarningsChart data={series} height={280} /></CardContent>
      </Card>
    </div>
  );
}

function TopProducts({ items, hrefFor }: { items: TopProduct[]; hrefFor?: (id: string) => string }) {
  return (
    <Card>
      <CardHeader><CardTitle>En çok tıklanan ürünler</CardTitle></CardHeader>
      <CardContent>
        {items.length === 0 ? <p className="text-sm text-muted">Henüz tıklama yok.</p> : (
          <ul className="divide-y divide-border">
            {items.map((p) => (
              <li key={p.productId} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <ProductThumb title={p.title} src={p.image} className="size-10" />
                <div className="min-w-0 flex-1">
                  {hrefFor ? <Link href={hrefFor(p.productId)} className="block truncate text-sm font-semibold hover:text-primary">{p.title}</Link> : <p className="truncate text-sm font-semibold">{p.title}</p>}
                  <p className="text-xs text-muted">{formatNumber(p.clicks)} tıklama</p>
                </div>
                <span className="text-sm font-semibold tabular-nums">{formatMoney(p.earnings)}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function Countries({ items }: { items: Countries[] }) {
  const max = Math.max(1, ...items.map((c) => c.clicks));
  return (
    <Card>
      <CardHeader><CardTitle>Ülkelere göre trafik</CardTitle></CardHeader>
      <CardContent className="grid gap-3">
        {items.length === 0 ? <p className="text-sm text-muted">Veri yok.</p> : items.map((c) => (
          <div key={c.country}>
            <div className="mb-1 flex justify-between text-sm"><span>{countryName(c.country)}</span><span className="tabular-nums text-muted">{formatNumber(c.clicks)}</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-chart-1" style={{ width: `${(c.clicks / max) * 100}%` }} /></div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function VendorDashboardView({ data }: { data: { plan: PlanStatus; series: DayPoint[]; totals: VisitTotals; countries: Countries[]; links: LinkCounts; topProducts: TopProduct[]; unpaid: { partnerId: string; username: string; avatar: string | null; clicks: number; amount: number }[]; productCount: number; activePartners: number } }) {
  const unpaidTotal = data.unpaid.reduce((a, b) => a + b.amount, 0);
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <PlanBadge plan={data.plan} />
        {(data.plan.state === "TRIAL" || data.plan.state === "PLAN") ? <span className="text-sm text-muted">{formatDate(data.plan.endsAt)} tarihine kadar · {daysUntil(data.plan.endsAt)} gün kaldı</span> : null}
      </div>
      {data.links.pending > 0 ? (
        <Card className="flex flex-wrap items-center justify-between gap-3 border-warning/40 bg-warning-soft p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-warning"><AlertTriangle className="size-4" /> {data.links.pending} partner başvurusu onayınızı bekliyor</p>
          <ButtonLink href={`${routes.vendor.links}?group=pending`} size="sm" variant="outline">İncele</ButtonLink>
        </Card>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Toplam tıklama" value={formatNumber(data.totals.clicks)} icon={MousePointerClick} hint={`${formatNumber(data.totals.unique)} tekil`} />
        <StatCard label="Bekleyen komisyon" value={formatMoney(data.totals.unpaid)} icon={Wallet} tone="accent" hint="Partnerlere ödenecek" />
        <StatCard label="Ödenen komisyon" value={formatMoney(data.totals.paid)} icon={BadgeDollarSign} tone="success" />
        <StatCard label="Aktif partner" value={data.activePartners} icon={Users} tone="warning" hint={`${data.productCount} aktif ürün · ${data.links.live} link`} />
      </div>
      <ChartSection series={data.series} title="Tıklama trafiği" money={false} />
      <div className="grid gap-4 lg:grid-cols-3">
        <TopProducts items={data.topProducts} hrefFor={routes.vendor.product} />
        <Countries items={data.countries} />
        <Card>
          <CardHeader><div><CardTitle>Ödeme bekleyen partnerler</CardTitle><CardDescription>Toplam {formatMoney(unpaidTotal)}</CardDescription></div></CardHeader>
          <CardContent>
            {data.unpaid.length === 0 ? <p className="text-sm text-muted">Bekleyen ödeme yok.</p> : (
              <ul className="divide-y divide-border">
                {data.unpaid.slice(0, 5).map((u) => (
                  <li key={u.partnerId} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <Avatar name={u.username} src={u.avatar} />
                    <div className="min-w-0 flex-1"><Link href={routes.vendor.payPartner(u.partnerId)} className="block truncate text-sm font-semibold hover:text-primary">{u.username}</Link><p className="text-xs text-muted">{u.clicks} geçerli tıklama</p></div>
                    <span className="text-sm font-semibold tabular-nums">{formatMoney(u.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
      {data.totals.clicks === 0 ? <EmptyState icon={Eye} title="Henüz trafik yok" description="Ürün ekleyin ve partnerlerin başvurularını onaylayın; tıklamalar burada görünür." action={<ButtonLink href={routes.vendor.newProduct}>Ürün ekle</ButtonLink>} /> : null}
      <p className="text-xs text-muted">Şüpheli (bot / kendi) tıklamalar: {formatNumber(data.totals.flagged)} — komisyon dışında tutuldu.</p>
    </div>
  );
}

export function PartnerDashboardView({ data }: { data: { series: DayPoint[]; totals: VisitTotals; countries: Countries[]; links: LinkCounts; topProducts: TopProduct[]; awaiting: { vendorId: string; brand: string; logo: string | null; clicks: number; amount: number }[]; awaitingTotal: number; topLinks: { linkId: string; code: string; title: string; clicks: number }[] } }) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Toplam tıklama" value={formatNumber(data.totals.clicks)} icon={MousePointerClick} hint={`${formatNumber(data.totals.unique)} tekil`} />
        <StatCard label="Bekleyen kazanç" value={formatMoney(data.awaitingTotal)} icon={Wallet} tone="accent" hint="Markalardan alacağınız" />
        <StatCard label="Tahsil edilen" value={formatMoney(data.totals.paid)} icon={BadgeDollarSign} tone="success" />
        <StatCard label="Aktif link" value={data.links.live} icon={Link2} tone="warning" hint={`${data.links.pending} başvuru bekliyor`} />
      </div>
      <ChartSection series={data.series} title="Link trafiğiniz" money />
      <div className="grid gap-4 lg:grid-cols-3">
        <TopProducts items={data.topProducts} />
        <Countries items={data.countries} />
        <Card>
          <CardHeader><div><CardTitle>Alacaklarınız</CardTitle><CardDescription>Markalara göre</CardDescription></div></CardHeader>
          <CardContent>
            {data.awaiting.length === 0 ? <p className="text-sm text-muted">Bekleyen alacak yok.</p> : (
              <ul className="divide-y divide-border">
                {data.awaiting.map((a) => (
                  <li key={a.vendorId} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <Avatar name={a.brand} src={a.logo} rounded="lg" />
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{a.brand}</p><p className="text-xs text-muted">{a.clicks} geçerli tıklama</p></div>
                    <span className="text-sm font-semibold tabular-nums">{formatMoney(a.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
      {data.links.all === 0 ? <EmptyState icon={Package} title="Henüz linkiniz yok" description="Pazaryerinden bir ürün seçip link talep edin." action={<ButtonLink href={routes.partner.products}>Pazaryerine git</ButtonLink>} /> : null}
      {data.totals.flagged > 0 ? <p className="flex items-center gap-2 text-xs text-muted"><ShieldAlert className="size-3.5" /> {formatNumber(data.totals.flagged)} şüpheli tıklama (bot / kendi tıklamanız) komisyon dışında tutuldu.</p> : null}
    </div>
  );
}
