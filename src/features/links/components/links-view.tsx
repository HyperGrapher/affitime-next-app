"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronRight, Link2, Search, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Avatar, ProductThumb } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Pager } from "@/components/ui/pager";
import { Skeleton } from "@/components/ui/skeleton";
import { LinkStatusBadge } from "@/components/shared/badges";
import { useDebounced } from "@/hooks/use-debounced";
import { formatDate } from "@/lib/dates";
import { formatMoney, formatNumber } from "@/lib/money";
import { routes } from "@/lib/routes";
import { errorMessage, notifyError, notifySuccess } from "@/lib/toast";
import { useTRPC } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import type { LinkRow } from "../service";

type Role = "VENDOR" | "PARTNER" | "ADMIN";
type Group = "pending" | "live" | "closed" | undefined;

const TABS: { key: Group; label: string }[] = [
  { key: undefined, label: "Tümü" }, { key: "pending", label: "Bekleyen" }, { key: "live", label: "Aktif" }, { key: "closed", label: "Kapalı" },
];

const detailHref = (role: Role, id: string) => (role === "VENDOR" ? routes.vendor.link(id) : role === "PARTNER" ? routes.partner.link(id) : `${routes.admin.links}/${id}`);

export function LinksView({ role, initialGroup }: { role: Role; initialGroup?: Group }) {
  const trpc = useTRPC();
  const qc = useQueryClient();
  const [group, setGroup] = useState<Group>(initialGroup);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const dq = useDebounced(q);
  const input = { page, pageSize: 10, q: dq || undefined, group };
  const opts = role === "ADMIN" ? trpc.links.adminList.queryOptions(input) : trpc.links.listMine.queryOptions(input);
  const query = useQuery({ ...opts, placeholderData: (prev) => prev });
  const counts = useQuery({ ...trpc.links.counts.queryOptions(), enabled: role !== "ADMIN" });

  const act = useMutation(trpc.links.vendorAct.mutationOptions({
    onSuccess: (_d, v) => { notifySuccess(v.action === "APPROVE" ? "Başvuru onaylandı" : "Başvuru reddedildi"); void qc.invalidateQueries({ queryKey: trpc.links.pathKey() }); void qc.invalidateQueries({ queryKey: trpc.notifications.pathKey() }); },
    onError: (e) => notifyError(errorMessage(e)),
  }));

  const badge = (g: Group) => (g && counts.data ? counts.data[g] : g === undefined && counts.data ? counts.data.all : undefined);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Link filtresi" className="flex gap-1 overflow-x-auto rounded-xl bg-surface-2 p-1">
          {TABS.map((tab) => (
            <button key={tab.label} role="tab" aria-selected={group === tab.key} onClick={() => { setGroup(tab.key); setPage(1); }} className={cn("whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-semibold transition", group === tab.key ? "bg-surface shadow-sm" : "text-muted hover:text-foreground")}>
              {tab.label}{badge(tab.key) !== undefined ? <span className="ml-1.5 text-xs text-muted">{badge(tab.key)}</span> : null}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input aria-label="Link ara" placeholder={role === "VENDOR" ? "Ürün veya partner ara…" : "Ürün veya marka ara…"} className="pl-9" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        </div>
      </div>

      {query.isPending ? <div className="grid gap-3">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-20" />)}</div>
      : query.isError ? <EmptyState title="Linkler yüklenemedi" action={<Button variant="outline" onClick={() => query.refetch()}>Tekrar dene</Button>} />
      : query.data.items.length === 0 ? <EmptyState icon={Link2} title="Link bulunamadı" description={role === "PARTNER" ? "Pazaryerinden bir ürün için link talep edin." : "Bu filtrede link yok."} />
      : (
        <ul className={cn("grid gap-3 transition-opacity", query.isPlaceholderData && "opacity-60")}>
          {query.data.items.map((l) => <LinkRowItem key={l.id} l={l} role={role} busy={act.isPending} onDecide={(action) => act.mutate({ id: l.id, action })} />)}
        </ul>
      )}
      {query.data ? <Pager page={query.data.page} pageCount={query.data.pageCount} total={query.data.total} onPage={setPage} /> : null}
    </div>
  );
}

function LinkRowItem({ l, role, busy, onDecide }: { l: LinkRow; role: Role; busy: boolean; onDecide: (a: "APPROVE" | "DENY") => void }) {
  const other = role === "PARTNER" ? { name: l.vendor.brand, src: l.vendor.logo } : { name: l.partner.username, src: l.partner.avatar };
  return (
    <li>
      <Card className="flex flex-col gap-3 p-4 transition-shadow hover:shadow-md sm:flex-row sm:items-center">
        <Link href={detailHref(role, l.id)} className="flex min-w-0 flex-1 items-center gap-3">
          <ProductThumb title={l.product.title} src={l.product.image} />
          <div className="min-w-0">
            <p className="truncate font-semibold">{l.product.title}</p>
            <p className="flex items-center gap-1.5 truncate text-sm text-muted"><Avatar name={other.name} src={other.src} className="size-4 text-[8px]" />{other.name} · {formatDate(l.createdAt)}</p>
          </div>
        </Link>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:justify-end">
          <LinkStatusBadge status={l.status} />
          <dl className="flex gap-5 text-sm">
            <div><dt className="text-xs text-muted">Tıklama</dt><dd className="font-semibold tabular-nums">{formatNumber(l.clicks)}</dd></div>
            <div><dt className="text-xs text-muted">{role === "PARTNER" ? "Kazanç" : "Komisyon"}</dt><dd className="font-semibold tabular-nums">{formatMoney(l.due)}</dd></div>
          </dl>
          {role === "VENDOR" && l.status === "AWAITING" ? (
            <div className="flex gap-2">
              <Button size="sm" disabled={busy} onClick={() => onDecide("APPROVE")}><Check /> Onayla</Button>
              <Button size="sm" variant="outline" disabled={busy} onClick={() => onDecide("DENY")}><X /> Reddet</Button>
            </div>
          ) : <Link href={detailHref(role, l.id)} aria-label="Detay" className="hidden text-muted sm:block"><ChevronRight className="size-5" /></Link>}
        </div>
      </Card>
    </li>
  );
}
