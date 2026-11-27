import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { VendorDashboard } from "@/features/dashboard/components/dashboards";
import { HydrateClient, prefetch, trpc } from "@/lib/trpc/server";

export const metadata: Metadata = { title: "Marka paneli" };

export default async function Page() {
  await prefetch(trpc.dashboard.vendor.queryOptions());
  return (
    <HydrateClient>
      <PageHeader title="Panel" description="Kampanyalarınızın son 30 günlük performansı" />
      <VendorDashboard />
    </HydrateClient>
  );
}
