import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { AdminDashboard } from "@/features/dashboard/components/admin-dashboard";
import { HydrateClient, prefetch, trpc } from "@/lib/trpc/server";

export const metadata: Metadata = { title: "Admin paneli" };

export default async function Page() {
  await prefetch(trpc.dashboard.admin.queryOptions());
  return (<HydrateClient><PageHeader title="Platform özeti" description="Tüm marka ve partner aktivitesi" /><AdminDashboard /></HydrateClient>);
}
