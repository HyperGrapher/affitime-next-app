"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/client";
import { ProductForm } from "./product-form";

export function EditProduct({ id }: { id: string }) {
  const trpc = useTRPC();
  const { data: p } = useSuspenseQuery(trpc.products.getMine.queryOptions({ id }));
  return (
    <ProductForm
      id={id}
      initial={{ title: p.title, summary: p.summary, description: p.description ?? "", productUrl: p.productUrl, image: p.image, categoryId: p.categoryId, tags: p.tags, price: p.price, cookieDays: p.cookieDays, clickCommission: p.clickCommission, clickCommissionType: p.clickCommissionType, saleCommission: p.saleCommission, saleCommissionType: p.saleCommissionType }}
    />
  );
}
