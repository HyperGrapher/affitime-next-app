import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { PayoutConfirm } from "@/features/payments/components/payments-views";
import { HydrateClient, prefetch, trpc } from "@/lib/trpc/server";

export const metadata: Metadata = { title: "Komisyon ödemesi" };

export default async function Page({ params }: { params: Promise<{ partnerId: string }> }) {
  const { partnerId } = await params;
  await prefetch(trpc.payments.vendorUnpaid.queryOptions());
  return (<HydrateClient><PageHeader title="Komisyon ödemesi" /><PayoutConfirm partnerId={partnerId} /></HydrateClient>);
}
