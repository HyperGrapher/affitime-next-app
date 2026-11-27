"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Pager } from "@/components/ui/pager";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo } from "@/lib/dates";
import { useTRPC } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { format, t } from "@/i18n";

export function NotificationsView() {
  const trpc = useTRPC();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const query = useQuery({ ...trpc.notifications.list.queryOptions({ page, pageSize: 10, unreadOnly }), placeholderData: (p) => p });
  const refresh = () => qc.invalidateQueries({ queryKey: trpc.notifications.pathKey() });
  const markRead = useMutation(trpc.notifications.markRead.mutationOptions({ onSuccess: refresh }));
  const markAll = useMutation(trpc.notifications.markAllRead.mutationOptions({ onSuccess: refresh }));

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" className="flex gap-1 rounded-xl bg-surface-2 p-1">
          {[["Tümü", false], ["Okunmamış", true]].map(([label, val]) => (
            <button key={String(label)} role="tab" aria-selected={unreadOnly === val} onClick={() => { setUnreadOnly(val as boolean); setPage(1); }} className={cn("rounded-lg px-3.5 py-1.5 text-sm font-semibold", unreadOnly === val ? "bg-surface shadow-sm" : "text-muted")}>{label as string}</button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={() => markAll.mutate()} disabled={markAll.isPending}><CheckCheck /> Tümünü okundu işaretle</Button>
      </div>
      {query.isPending ? <div className="grid gap-2">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-16" />)}</div>
      : !query.data || query.data.items.length === 0 ? <EmptyState icon={Bell} title="Bildirim yok" description="Yeni gelişmeler burada görünecek." />
      : (
        <ul className="grid gap-2">
          {query.data.items.map((n) => {
            const text = format(t.notification[n.type], n.data as Record<string, string | number>);
            const body = (
              <Card className={cn("flex items-start gap-3 p-4 transition-colors hover:bg-surface-2", !n.read && "border-primary/40 bg-primary-soft/40")}>
                <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-accent")} aria-label={n.read ? undefined : "Okunmamış"} />
                <div className="min-w-0 flex-1"><p className="text-sm font-medium">{text}</p><p className="mt-0.5 text-xs text-muted">{timeAgo(n.createdAt)}</p></div>
              </Card>
            );
            return (
              <li key={n.id}>
                {n.href ? <Link href={n.href} onClick={() => !n.read && markRead.mutate({ id: n.id })}>{body}</Link> : <button className="w-full text-left" onClick={() => !n.read && markRead.mutate({ id: n.id })}>{body}</button>}
              </li>
            );
          })}
        </ul>
      )}
      {query.data ? <Pager page={query.data.page} pageCount={query.data.pageCount} total={query.data.total} onPage={setPage} /> : null}
    </div>
  );
}
