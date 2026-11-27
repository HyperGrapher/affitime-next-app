import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { PartnerDashboard } from "@/features/dashboard/components/dashboards";
import { HydrateClient, prefetch, trpc } from "@/lib/trpc/server";
import { requireRole } from "@/server/guards";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Partner paneli" };

export default async function Page() {
  const viewer = await requireRole(["PARTNER"]);
  if (!viewer.partner?.onboarded) redirect(routes.partner.onboarding);
  await prefetch(trpc.dashboard.partner.queryOptions());
  return (<HydrateClient><PageHeader title="Panel" description="Linklerinizin son 30 günlük performansı" /><PartnerDashboard /></HydrateClient>);
}
