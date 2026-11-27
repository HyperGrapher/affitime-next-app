import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { StoreApiView } from "@/features/account/components/store-api-view";
import { HydrateClient, prefetch, trpc } from "@/lib/trpc/server";

export const metadata: Metadata = { title: "Mağaza API" };

export default async function Page() {
  await prefetch(trpc.account.storeApi.queryOptions());
  return (<HydrateClient><PageHeader title="Mağaza API" description="Mağaza eklentiniz için erişim anahtarı" /><StoreApiView /></HydrateClient>);
}
