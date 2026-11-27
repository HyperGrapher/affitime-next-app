"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { BadgeDollarSign, Boxes, Mail, MessageSquare, MousePointerClick, ShieldAlert, Wallet } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { ClicksChart } from "@/components/shared/charts";
import { formatMoney, formatNumber } from "@/lib/money";
import { routes } from "@/lib/routes";
import { useTRPC } from "@/lib/trpc/client";
import { t } from "@/i18n";

export function AdminDashboard() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.dashboard.admin.queryOptions());
  const vendors = (data.users.VENDOR ?? 0);
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Gelir (plan + kampanya)" value={formatMoney(data.revenue)} icon={BadgeDollarSign} tone="success" />
        <StatCard label="Komisyon ödeme hacmi" value={formatMoney(data.payoutVolume)} icon={Wallet} tone="accent" />
        <StatCard label="Toplam tıklama" value={formatNumber(data.totals.clicks)} icon={MousePointerClick} hint={`${formatNumber(data.totals.flagged)} şüpheli`} />
        <StatCard label="Aktif ürün" value={data.products} icon={Boxes} tone="warning" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2"><CardHeader><div><CardTitle>Platform trafiği</CardTitle><CardDescription>Son 30 gün</CardDescription></div></CardHeader><CardContent><ClicksChart data={data.series} /></CardContent></Card>
        <Card>
          <CardHeader><CardTitle>Kullanıcılar</CardTitle></CardHeader>
          <CardContent className="grid gap-3 text-sm">
            {(["VENDOR", "PARTNER", "ADMIN", "MODERATOR"] as const).map((r) => <div key={r} className="flex justify-between"><span className="text-muted">{t.roles[r]}</span><b>{data.users[r] ?? 0}</b></div>)}
            <hr className="border-border" />
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Marka planları ({vendors})</p>
            {(["PLAN", "TRIAL", "TRIAL_ENDED", "PLAN_ENDED"] as const).map((s) => <div key={s} className="flex justify-between"><span className="text-muted">{t.plan.state[s]}</span><b>{data.planStates[s]}</b></div>)}
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href={routes.admin.messages}><StatCard label="Yanıt bekleyen mesaj" value={data.unhandled} icon={MessageSquare} tone="accent" /></Link>
        <Link href={routes.admin.outbox}><StatCard label="Gönderilen e-posta" value={data.emails} icon={Mail} /></Link>
        <Link href={routes.admin.payments}><StatCard label="Başarısız ödeme" value={data.failedPayments} icon={ShieldAlert} tone="warning" /></Link>
        <Card className="sm:col-span-3"><CardHeader><CardTitle>Link durumları</CardTitle></CardHeader><CardContent className="grid gap-2 text-sm sm:grid-cols-3">{Object.entries(data.links).map(([k, v]) => <div key={k} className="flex justify-between rounded-lg bg-surface-2 px-3 py-2"><span className="text-muted">{t.linkStatus[k as keyof typeof t.linkStatus] ?? k}</span><b>{v}</b></div>)}</CardContent></Card>
      </div>
    </div>
  );
}
