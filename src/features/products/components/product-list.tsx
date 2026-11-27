"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Megaphone, Package, Pencil, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Select } from "@/components/ui/input";
import { Pager } from "@/components/ui/pager";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounced } from "@/hooks/use-debounced";
import { routes } from "@/lib/routes";
import { errorMessage, notifyError, notifySuccess } from "@/lib/toast";
import { useTRPC } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import type { ProductDTO } from "../service";
import { CampaignDialog } from "@/features/payments/components/campaign-dialog";
import { ProductCard } from "./product-card";

type Mode = "vendor" | "marketplace";

/** One list for both roles: vendors manage their products, partners browse the marketplace. */
export function ProductList({ mode }: { mode: Mode }) {
  const trpc = useTRPC();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [status, setStatus] = useState<"ACTIVE" | "ARCHIVED" | undefined>(mode === "vendor" ? "ACTIVE" : undefined);
  const [sort, setSort] = useState<"new" | "price_asc" | "price_desc" | "commission">("new");
  const [toArchive, setToArchive] = useState<ProductDTO | null>(null);
  const [toPromote, setToPromote] = useState<ProductDTO | null>(null);
  const dq = useDebounced(q);

  const input = { page, pageSize: 9, q: dq || undefined, categoryId, sort, ...(mode === "vendor" ? { status } : {}) };
  const query = useQuery({ ...(mode === "vendor" ? trpc.products.listMine.queryOptions(input) : trpc.products.browse.queryOptions(input)), placeholderData: (p) => p });
  const categories = useQuery(trpc.catalog.categories.queryOptions());
  const archive = useMutation(trpc.products.archive.mutationOptions({
    onSuccess: () => { notifySuccess("Ürün arşivlendi; ilgili linkler kapatıldı"); setToArchive(null); void qc.invalidateQueries({ queryKey: trpc.products.pathKey() }); void qc.invalidateQueries({ queryKey: trpc.links.pathKey() }); },
    onError: (e) => notifyError(errorMessage(e)),
  }));
  const reset = <T,>(set: (v: T) => void) => (v: T) => { set(v); setPage(1); };

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input aria-label="Ürün ara" placeholder="Ürün veya marka ara…" className="pl-9" value={q} onChange={(e) => reset(setQ)(e.target.value)} />
        </div>
        <Select aria-label="Kategori" className="w-full sm:w-52" value={categoryId ?? ""} onChange={(e) => reset(setCategoryId)(e.target.value ? Number(e.target.value) : undefined)}>
          <option value="">Tüm kategoriler</option>
          {categories.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        {mode === "vendor" ? (
          <Select aria-label="Durum" className="w-full sm:w-40" value={status ?? ""} onChange={(e) => reset(setStatus)((e.target.value || undefined) as typeof status)}>
            <option value="ACTIVE">Aktif</option><option value="ARCHIVED">Arşiv</option><option value="">Tümü</option>
          </Select>
        ) : null}
        <Select aria-label="Sırala" className="w-full sm:w-48" value={sort} onChange={(e) => reset(setSort)(e.target.value as typeof sort)}>
          <option value="new">En yeni</option><option value="commission">En yüksek komisyon</option><option value="price_asc">Fiyat (artan)</option><option value="price_desc">Fiyat (azalan)</option>
        </Select>
      </div>

      {query.isPending ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-56" />)}</div>
      : query.isError ? <EmptyState title="Ürünler yüklenemedi" action={<Button variant="outline" onClick={() => query.refetch()}>Tekrar dene</Button>} />
      : query.data.items.length === 0 ? (
        <EmptyState icon={Package} title="Ürün bulunamadı" description={mode === "vendor" ? "İlk ürününüzü ekleyerek partnerlerin başvurusunu bekleyin." : "Filtreleri değiştirmeyi deneyin."} action={mode === "vendor" ? <ButtonLink href={routes.vendor.newProduct}>Ürün ekle</ButtonLink> : undefined} />
      ) : (
        <ul className={cn("grid gap-4 transition-opacity sm:grid-cols-2 xl:grid-cols-3", query.isPlaceholderData && "opacity-60")}>
          {query.data.items.map((p) => (
            <li key={p.id}>
              <ProductCard
                p={p}
                showVendor={mode === "marketplace"}
                href={mode === "vendor" ? routes.vendor.product(p.id) : routes.product(p.id)}
                actions={mode === "vendor" ? (
                  p.status === "ACTIVE" ? (
                    <>
                      <Button size="sm" variant="outline" aria-label="Öne çıkar" title="Pazaryeri kampanyası" onClick={() => setToPromote(p)}><Megaphone /></Button>
                      <ButtonLink size="sm" variant="outline" href={routes.vendor.product(p.id)} aria-label="Düzenle"><Pencil /></ButtonLink>
                      <Button size="sm" variant="outline" aria-label="Arşivle" onClick={() => setToArchive(p)}><Trash2 /></Button>
                    </>
                  ) : null
                ) : <Link href={routes.product(p.id)} className="inline-flex h-8 items-center rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground hover:brightness-110">İncele</Link>}
              />
            </li>
          ))}
        </ul>
      )}
      {query.data ? <Pager page={query.data.page} pageCount={query.data.pageCount} total={query.data.total} onPage={setPage} /> : null}

      <ConfirmDialog open={!!toArchive} onOpenChange={(o) => !o && setToArchive(null)} destructive pending={archive.isPending} title="Ürün arşivlensin mi?" description={`“${toArchive?.title ?? ""}” pazaryerinden kalkar ve ${toArchive?.linkCount ?? 0} partner linki kapanır. Bu işlem geri alınamaz.`} confirmLabel="Arşivle" onConfirm={() => toArchive && archive.mutate({ id: toArchive.id })} />
      <CampaignDialog product={toPromote} onClose={() => setToPromote(null)} />
    </div>
  );
}
