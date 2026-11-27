import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { VendorPayments } from "@/features/payments/components/payments-views";
import { HydrateClient, prefetch, trpc } from "@/lib/trpc/server";

export const metadata: Metadata = { title: "Ödemeler" };

export default async function Page() {
  await prefetch(trpc.payments.vendorUnpaid.queryOptions());
  return (<HydrateClient><PageHeader title="Ödemeler" description="Partner komisyonları ve ödeme geçmişi" /><VendorPayments /></HydrateClient>);
}
