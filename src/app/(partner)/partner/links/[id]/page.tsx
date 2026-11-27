import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { LinkDetail } from "@/features/links/components/link-detail";
import { HydrateClient, prefetch, trpc } from "@/lib/trpc/server";

export const metadata: Metadata = { title: "Link detayı" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prefetch(trpc.links.detail.queryOptions({ id }));
  return (<HydrateClient><PageHeader title="Link detayı" /><LinkDetail id={id} role="PARTNER" /></HydrateClient>);
}
