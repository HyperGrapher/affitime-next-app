import { Clock, Percent } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductThumb } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RequestLinkButton } from "@/features/links/components/request-link-button";
import { getPublicProduct } from "@/features/products/service";
import { describeCommission } from "@/domain/commission";
import { db } from "@/server/db";
import { getViewer } from "@/server/session";
import { formatMoney } from "@/lib/money";
import { routes } from "@/lib/routes";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const p = await getPublicProduct(db, (await params).id);
  return p ? { title: p.title, description: p.summary } : {};
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getPublicProduct(db, id);
  if (!product) notFound();
  const viewer = await getViewer();
  const link = viewer?.partner ? await db.link.findUnique({ where: { productId_partnerId: { productId: id, partnerId: viewer.partner.id } }, select: { id: true, status: true } }) : null;
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div>
          <div className="flex items-start gap-4"><ProductThumb title={product.title} src={product.image} className="size-20" /><div><Badge>{product.category.name}</Badge><h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight">{product.title}</h1><p className="mt-1 text-muted">{product.vendor.brand}</p></div></div>
          <p className="mt-8 text-lg leading-relaxed">{product.summary}</p>
          {product.description ? <p className="mt-4 whitespace-pre-line leading-relaxed text-muted">{product.description}</p> : null}
          <div className="mt-6 flex flex-wrap gap-2">{product.tags.map((t) => <Badge key={t} tone="primary">#{t}</Badge>)}</div>
        </div>
        <Card className="h-fit p-6">
          <p className="text-sm text-muted">Ürün fiyatı</p><p className="text-3xl font-extrabold tabular-nums">{formatMoney(product.price)}</p>
          <dl className="mt-5 grid gap-3 text-sm">
            <div className="flex justify-between"><dt className="flex items-center gap-2 text-muted"><Percent className="size-4" /> Tıklama</dt><dd className="font-semibold">{describeCommission(product.clickCommission, product.clickCommissionType)}</dd></div>
            <div className="flex justify-between"><dt className="flex items-center gap-2 text-muted"><Percent className="size-4" /> Satış</dt><dd className="font-semibold">{describeCommission(product.saleCommission, product.saleCommissionType)}</dd></div>
            <div className="flex justify-between"><dt className="flex items-center gap-2 text-muted"><Clock className="size-4" /> Çerez süresi</dt><dd className="font-semibold">{product.cookieDays} gün</dd></div>
          </dl>
          <div className="mt-6">
            {viewer?.partner ? <RequestLinkButton productId={id} existing={link ? { id: link.id, status: link.status } : null} />
            : viewer ? <p className="text-sm text-muted">Link talebi yalnızca partner hesapları içindir.</p>
            : <ButtonLink href={routes.signup("partner")} className="w-full" size="lg">Partner olarak başvur</ButtonLink>}
          </div>
        </Card>
      </div>
    </div>
  );
}
