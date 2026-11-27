"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { PartnerDashboardView, VendorDashboardView } from "@/components/shared/dashboard-view";
import { useTRPC } from "@/lib/trpc/client";

export function VendorDashboard() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.dashboard.vendor.queryOptions());
  return <VendorDashboardView data={data} />;
}

export function PartnerDashboard() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.dashboard.partner.queryOptions());
  return <PartnerDashboardView data={data} />;
}
