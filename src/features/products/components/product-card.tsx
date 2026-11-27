import { Clock, Sparkles } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ProductThumb } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { describeCommission } from "@/domain/commission";
import { formatMoney } from "@/lib/money";
import type { ProductDTO } from "../service";

export function ProductCard({ p, href, actions, showVendor = true }: { p: ProductDTO; href: string; actions?: ReactNode; showVendor?: boolean }) {
  return (
    <Card className="flex h-full flex-col p-4 transition-shadow hover:shadow-md">
      <Link href={href} className="flex items-start gap-3">
        <ProductThumb title={p.title} src={p.image} className="size-14" />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 font-semibold leading-snug">{p.title}</p>
          <p className="mt-0.5 truncate text-xs text-muted">{showVendor ? `${p.vendor.brand} · ` : ""}{p.category.name}</p>
        </div>
      </Link>
      <p className="mt-3 line-clamp-2 flex-1 text-sm text-muted">{p.summary}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {p.featuredUntil ? <Badge tone="accent"><Sparkles className="size-3" /> Öne çıkan</Badge> : null}
        {p.status === "ARCHIVED" ? <Badge>Arşivde</Badge> : null}
        {p.clickCommission > 0 ? <Badge tone="primary">Tık {describeCommission(p.clickCommission, p.clickCommissionType)}</Badge> : null}
        {p.saleCommission > 0 ? <Badge tone="success">Satış {describeCommission(p.saleCommission, p.saleCommissionType)}</Badge> : null}
        <Badge><Clock className="size-3" /> {p.cookieDays} gün</Badge>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
        <span className="text-lg font-bold tabular-nums">{formatMoney(p.price)}</span>
        <div className="flex gap-2">{actions}</div>
      </div>
    </Card>
  );
}
