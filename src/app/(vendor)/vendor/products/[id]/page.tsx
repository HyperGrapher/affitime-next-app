import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { EditProduct } from "@/features/products/components/edit-product";
import { HydrateClient, prefetchOrNotFound, trpc } from "@/lib/trpc/server";

export const metadata: Metadata = { title: "Ürünü düzenle" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prefetchOrNotFound(trpc.products.getMine.queryOptions({ id }));
  return (<HydrateClient><PageHeader title="Ürünü düzenle" description="Değişiklikler yalnızca yeni link başvurularını etkiler" /><EditProduct id={id} /></HydrateClient>);
}
