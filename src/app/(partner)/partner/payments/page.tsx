import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { PartnerPayments } from "@/features/payments/components/payments-views";
import { HydrateClient, prefetch, trpc } from "@/lib/trpc/server";

export const metadata: Metadata = { title: "Ödemeler" };

export default async function Page() {
  await prefetch(trpc.payments.partnerAwaiting.queryOptions());
  return (<HydrateClient><PageHeader title="Ödemeler" description="Bekleyen alacaklar ve tahsil edilen komisyonlar" /><PartnerPayments /></HydrateClient>);
}
